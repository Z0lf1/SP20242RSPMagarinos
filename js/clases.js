class Persona
{
    constructor(id, nombre, apellido, fechaNacimiento)
    {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.fechaNacimiento = fechaNacimiento;
    }

    toString()
    {
        return `id: ${this.id}, Nombre: ${this.nombre}, Apellido: ${this.apellido}, fecha 
 de Nacimiento: ${this.fechaNacimiento},`;
    }

}

class Ciudadano extends Persona
{
    constructor(id, nombre, apellido, fechaNacimiento, dni)
    {
        super(id, nombre, apellido, fechaNacimiento);
        this.dni = dni;
       
        
        
    }

    toString()
    {
        return  `Ciudadano: ` + super.toString()  + `DNI: ${this.dni}`;
    }

}

class Extranjero extends Persona
{
    constructor(id, nombre, apellido ,fechaNacimiento, paisOrigen)
    {
        super(id, nombre, apellido ,fechaNacimiento);
        this.paisOrigen = paisOrigen;

        
    }

    toString() 
    {
        return `Extranjero: ` + super.toString() + `Pais Origen: ${this.paisOrigen}`;
    }

}