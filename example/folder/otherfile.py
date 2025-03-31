# This is an example of a Python module that defines classes for vehicles and engines.
# The classes include a base Vehicle class, an Engine class, a Car class that inherits from Vehicle,
# and a Garage class that can hold multiple vehicles.

class Vehicle:
    """Base class for all vehicles."""
    def __init__(self, make, model, year):
        self.make = make
        self.model = model
        self.year = year

    def get_info(self):
        return f"{self.year} {self.make} {self.model}"


class Car(Vehicle):
    """Class representing a car, inheriting from Vehicle."""
    def __init__(self, make, model, year, engine, doors):
        super().__init__(make, model, year)
        self.engine = engine
        self.doors = doors

    def get_info(self):
        base_info = super().get_info()
        engine_info = self.engine.get_engine_info()
        return f"{base_info}, {self.doors}-door, Engine: {engine_info}"


class Garage:
    """Class representing a garage that holds vehicles."""
    def __init__(self):
        self.vehicles = []

    def add_vehicle(self, vehicle):
        self.vehicles.append(vehicle)

    def list_vehicles(self):
        return [vehicle.get_info() for vehicle in self.vehicles]

# Example usage:
engine1 = Engine(300, "Gasoline")
car1 = Car("Toyota", "Camry", 2020, engine1, 4)
engine2 = Engine(150, "Diesel")
car2 = Car("Ford", "Focus", 2018, engine2, 4)
garage = Garage()
garage.add_vehicle(car1)
garage.add_vehicle(car2)
print(garage.list_vehicles())
# Output: ['2020 Toyota Camry, 4-door, Engine: 300 HP, Gasoline', '2018 Ford Focus, 4-door, Engine: 150 HP, Diesel']
