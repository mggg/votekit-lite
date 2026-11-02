"""Install votekit in a JupyterLite (Pyodide) kernel: `await install()`, once per kernel."""

import importlib.util
import pathlib
import sys
import types

import micropip


def _stub_wasm_less_deps():
    # numba has no wasm build. votekit's only @njit kernel (graphs/pairwise_comparison_graph,
    # used by Schulze/Ranked Pairs/Condo-Borda/dominating sets) runs as plain Python instead:
    # correct, slower on big profiles. Upstream fix: make numba optional in votekit.
    numba = types.ModuleType("numba")
    numba.njit = lambda *a, **k: a[0] if a and callable(a[0]) else (lambda f: f)
    numba.float64 = numba.int32 = type("NumbaType", (), {"__getitem__": lambda self, _: self})()

    # psutil has no wasm build. votekit only reads available memory for the slate-BT size
    # guard. 2 GiB is roughly the usable wasm32 heap; not measured.
    psutil = types.ModuleType("psutil")
    psutil.virtual_memory = lambda: types.SimpleNamespace(
        total=2**31, available=2**31, used=0, percent=0.0
    )
    sys.modules.setdefault("numba", numba)
    sys.modules.setdefault("psutil", psutil)


def _installed_file(module: str) -> pathlib.Path:
    # find_spec on a submodule imports only its (empty) parent package, so patching is still
    # in time for the real import.
    return pathlib.Path(importlib.util.find_spec(module).origin)


async def install(votekit_version: str = "3.5.0") -> None:
    """3.5.0 matches the lambda. Safe to call again in the same kernel."""
    _stub_wasm_less_deps()

    # votekit's runtime deps minus numba/psutil/types-* stubs. Most come from the Pyodide
    # distribution; seaborn and apportionment are pure-Python wheels from PyPI.
    await micropip.install(
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
    # np.arange(seats) then (d + 1) * (d + 2), which overflows past 46,340 seats. votekit
    # apportions *voters* to blocs, so any profile over 46,340 voters silently gets wrong bloc
    # sizes. Upstream fix: dtype=np.int64 in apportionment.
    path = _installed_file("apportionment.methods")
    src = path.read_text()
    if "np.arange(seats, dtype=np.int64)" not in src:
        assert "np.arange(seats)" in src, "apportionment changed; re-check the int32 overflow patch"
        path.write_text(src.replace("np.arange(seats)", "np.arange(seats, dtype=np.int64)"))

    # deps=False skips votekit's numba/psutil pins.
    await micropip.install(f"votekit=={votekit_version}", deps=False)

    # Python 3.14 made typing.Union aliases immutable, and votekit's __init__ files set
    # __module__ on every export (some exports are Union aliases), so imports crash. Skip
    # objects without a __dict__. Still needed on votekit's 3.6.0 branch; upstream fix is the
    # same one-line change in each loop.
    for init in _installed_file("votekit").parent.rglob("__init__.py"):
        init.write_text(
            init.read_text().replace('hasattr(_obj, "__module__")', 'hasattr(_obj, "__dict__")')
        )

    import votekit  # fail here, not in the user's next cell

    print(f"votekit {votekit_version} ready on Python {sys.version.split()[0]}")
