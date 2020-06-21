class Brand {
    constructor(id, brand) {
        this.id = id;
        this.name_brand = brand;
    }

    static from(json) {
        return Object.assign(new Brand(), json);
    }
}

class Vehicle {
    constructor(id, category, brand, model) {
        this.id = id;
        this.category = category;
        this.brand = brand;
        this.model = model;
    }

    static from(json) {
        return Object.assign(new Vehicle(), json);
    }
}

export { Brand, Vehicle }