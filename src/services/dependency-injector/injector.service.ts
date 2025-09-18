// definición del tipo/contrato del inyector
export type Injector = {
  providers: Record<string,unknown>;
};

//variable no accesible desde fuera que tiene la informacion del inyector
const injector: Injector = {
  providers: {},
};

//inicialización de los providers, { provA: new InstanceProvA()m ...}
export const initProviders = (providers: Record<string,unknown> = {}) => {
  injector.providers = {...providers};
};

//añadir providers a los ya existentes
export const addProviders = (providers: Record<string,unknown>) => {
  injector.providers = {
    ...injector.providers,
    ...providers,
  };
};

// función para obtener/inyectar un provider. Lanza un error si no existe.
// La sintaxis <T> en POO son Generics, lo necesitamos para saber decirle a TypeScript qué forma tiene el provider al inyectarse
// ya que nuestro inyector es una caja de muchos posibles tipos.
export const inject = <T>(name: string): T => {
  const provider = injector.providers[name] as T;
  if(!provider) {
    throw new Error(`Injector Error: no provider found for ${name}`)
  }
  return provider;
};
