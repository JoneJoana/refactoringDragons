import { DragonTypes, type Dragon } from './dragon.model'
import { MemoryDragonRepository } from './repositories/memory-dragon-repository';
import { initProviders } from '../services/dependency-injector/injector.service';
import { createListeners, createUI } from './dragon.component'

// operación reutilizable que renderiza un dragon en un test.
const renderTestDragon = (dragon?: Dragon) => {
  const element = createUI(dragon)
  document.body.appendChild(element)
}
const dragonMock: Dragon = {
  id: '1',
  name: 'Smaug',
  type: DragonTypes.FIRE,
  age: 120
}

describe('Given a Dragon component', () => {
  it('should render empty dragon form when no initial dragon', () => {
    renderTestDragon();

    const dragonName: HTMLInputElement | null = document.querySelector('#name') // buscamos el input de formulario a través de su nombre
    expect(dragonName?.value).toBe('') // esperamos que su valor esté vacío
  })

  it('should render the given initial dragon', () => {
    // creamos un mock (simulación) de dragón inicial como objeto
    renderTestDragon(dragonMock);    
    // buscamos el nombre dentro de la parte del detalle
    const dragonName: HTMLElement | null = document.querySelector('.dragon-detail > h2')
    expect(document.querySelectorAll('.dragon-detail')).toHaveLength(1) // espero que solo haya uno
    expect(dragonName?.textContent).toBe(dragonMock.name) // además, espero que su texto sea el nombre del dragon
  })
});

describe("When applying listeners", () => {
  // creación de la instancia de la dependencia invertida (D de SOLID)
  const dragonRepository = new MemoryDragonRepository();

  // Como siempre que tenemos listeners hay que renderizar un dragón y añadir sus listeners,
  // añadimos ese código en un beforeEach, el cual se ejecuta antes de cada test
  beforeEach(() => {
    // iniciamos el inyector con el provider del dragonRepository, el que usa nuestro componente
    initProviders({ dragonRepository });
    renderTestDragon();
    createListeners();
  });

  // despues de cada caso de test debemos borrar todo la "basura" que va generando nuestro test.
  // En este caso, lo que hayamos almacenado en el sistema de persistencia
  afterEach(async () => {
    await dragonRepository.deleteAll();
  });

  it("should create a dragon", async () => {
    // recuperamos el formulario y los inputs
    const form = document.querySelector<HTMLFormElement>("#dragon-form")!;
    const nameInput =
      form.querySelector<HTMLInputElement>("input[name='name']")!;
    const typeInput = form.querySelector<HTMLInputElement>(
      "select[name='type']"
    )!;
    const ageInput = form.querySelector<HTMLInputElement>("input[name='age']")!;

    // lo rellenamos con los datos del dragón que queremos guardar
    nameInput.value = dragonMock.name;
    typeInput.value = dragonMock.type;
    ageInput.value = dragonMock.age.toString();

    // simulamos el submit del formulario por parte del usuario
    form.dispatchEvent(new Event("submit", { bubbles: true }));

    // comprobamos que efectivamente el dragon se encuentra en el storage
    const createdDragon = await dragonRepository.findDragonById("1");
    expect(createdDragon).toEqual(dragonMock);
  });
});
