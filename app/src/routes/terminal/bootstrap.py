# Runs once in Pyodide before the terminal opens. Installs votekit without forking it.
import importlib.util
import sys
import types

import micropip

# ponytail: numba has no wasm build. votekit's only @njit kernel (graphs/pairwise_comparison_graph,
# used by Schulze/Ranked Pairs/Condo-Borda/dominating sets) runs as plain Python instead. That is
# slow on big profiles; the fix is upstream: make numba an optional import in votekit.
numba = types.ModuleType("numba")
numba.njit = lambda *a, **k: a[0] if a and callable(a[0]) else (lambda f: f)
numba.float64 = numba.int32 = type("NumbaType", (), {"__getitem__": lambda self, _: self})()

# ponytail: psutil has no wasm build. votekit only reads available memory for the slate-BT
# size guard. 2 GiB is roughly the usable wasm32 heap; not measured.
psutil = types.ModuleType("psutil")
psutil.virtual_memory = lambda: types.SimpleNamespace(
    total=2**31, available=2**31, used=0, percent=0.0
)

sys.modules.update(numba=numba, psutil=psutil)

# votekit's runtime deps minus numba/psutil/types-* stubs. Most come from the Pyodide
# distribution; seaborn and apportionment are pure-Python wheels from PyPI.
await micropip.install(  # top-level await is fine under runPythonAsync
    [
        "numpy",
        "scipy",
        "pandas",
        "matplotlib",
        "scikit-learn",
        "networkx",
        "pydantic",
        "jinja2",
        "seaborn",
        "apportionment==1.0",
    ]
)

# numpy's default int is int32 on wasm32. apportionment's Huntington-Hill computes
# np.arange(seats) then (d + 1) * (d + 2), which overflows past 46,340 seats. votekit apportions
# *voters* to blocs, so any profile over 46,340 voters gets wrong bloc sizes (silently).
# Patch the installed source before votekit imports it. Upstream fix: dtype=np.int64 there.
_apportion_py = importlib.util.find_spec("apportionment.methods").origin
with open(_apportion_py) as f:
    _src = f.read()
assert "np.arange(seats)" in _src, "apportionment changed; re-check the int32 overflow patch"
with open(_apportion_py, "w") as f:
    f.write(_src.replace("np.arange(seats)", "np.arange(seats, dtype=np.int64)"))

# deps=False skips votekit's numba/psutil pins, and its numpy/scipy/matplotlib/sklearn/networkx
# floors, which Pyodide 0.29 ships older versions of. 3.4.0 matches the lambda's pinned commit.
await micropip.install("votekit==3.4.0", deps=False)

import votekit  # fail here, not at the first prompt
from pyodide.console import PyodideConsole, repr_shorten

_console = PyodideConsole(globals())


async def repl(line: str) -> str:
    """Run one line like the CPython REPL; returns the next prompt."""
    fut = _console.push(line)
    if fut.syntax_check == "incomplete":
        return "... "
    try:
        result = await fut
        if result is not None:
            print(repr_shorten(result))
    except BaseException:
        print(fut.formatted_error, end="", file=sys.stderr)
    return ">>> "
