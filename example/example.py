# Check on the [docs](/home/mattdq/Comment-Linker/example/otherfile.py:16) for more details. ← Absolute path with line number
# Check on the [docs](/home/mattdq/Comment-Linker/example/otherfile.py) for more details. ← Absolute path without line number
# Check on the [docs](folder/otherfile.py:16) for more details. ← Relative path with line number
# Check on the [docs](folder/otherfile.py) for more details. ← Relative path without line number
# Check on the [docs](otherfile.py:16) for more details. ← Relative path with line number
# Check on the [docs](otherfile.py) for more details. ← Relative path without line number
class Engine:
    """Class representing an engine."""
    def __init__(self, horsepower, fuel_type):
        self.horsepower = horsepower
        self.fuel_type = fuel_type

    def get_engine_info(self):
        return f"{self.horsepower} HP, {self.fuel_type}"