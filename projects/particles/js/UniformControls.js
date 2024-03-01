// @ts-check
export class UniformControls
{
    /** @type {Record<string, number>} */
    static Defaults = 
    {
        particles_count: 100000,
        pheromone_decay_factor: 0.995,
        step_size: 1.1313131345364123,
        direction_change_angle: 2, // 1313131345364123
        viewing_distance: 4.1313131345364123
    };
    constructor()
    {
        this.element = document.createElement('table');
        let params = new URLSearchParams(window.location.search);
        /** @type {(name: string, short_name: string) => number} */
        this._value_provider = (name, short_name) => 
        {
            let default_value = UniformControls.Defaults[name.replaceAll('-', '_')];
            let param_value = params.get(short_name);
            if (!param_value) return default_value;
            let value = Number.parseFloat(param_value);
            if (Number.isNaN(value)) return default_value;
            return value;
        };
        this.particles_count = this._createInputControl({ name: 'particles-count', short_name: 'pc', title: 'Liczba cząsteczek', type: 'number' }, { disabled: 'disabled' })
        this.pheromone_decay_factor = this._createInputControl({ name: 'pheromone-decay-factor', short_name: 'pdf', title: 'Współczynnik zanikania feromonu', type: 'number' }, { step: 0.001 })
        this.step_size = this._createInputControl({ name: 'step-size', short_name: 'ss', title: 'Długość kroku', type: 'number' }, { step: 0.1 });
        this.direction_change_angle = this._createInputControl({ name: 'direction-change-angle', short_name: 'dca', title: 'Kąt zmiany kierunku', type: 'number' }, { min: 0, max: 90, step: 0.1 });
        this.viewing_distance = this._createInputControl({ name: 'viewing-distance', short_name: 'vd', title: 'Odległość widzenia', type: 'number' }, { min: 0.5, max: 50, step: 0.1 });
        this.link = this._createRow('Link do bieżących ustawień');
        this.link.td_value.id = 'link';
        this._updateLink();
    }
    _updateLink()
    {
        let { origin, pathname } = window.location;
        let parameters = [this.particles_count, this.pheromone_decay_factor, this.step_size, this.direction_change_angle, this.viewing_distance];
        let url_parameters = parameters.map(({ input, short_name }) => `${short_name}=${input.valueAsNumber}`).join('&');
        this.link.td_value.innerText = `${origin}${pathname}?${url_parameters}`;
    }
    /**
     * @param {{ name: string, short_name: string, title: string, type: string }} param0 
     * @param {{}} [input_properties]
     */
    _createInputControl({ name, short_name, title, type }, input_properties)
    {
        let value = this._value_provider(name, short_name);
        let { td_value } = this._createRow(title);
        /** @type {HTMLInputElement} */
        let input = td_value.appendChild(Object.assign(document.createElement('input'), { type, value, ...input_properties }));
        let control = { input, changed: true, short_name };
        input.addEventListener('change', () => control.changed = true); 
        return control;
    }
    /**
     * @param {string} title 
     */
    _createRow(title)
    {
        let tr = document.createElement('tr');
        let td_label = tr.appendChild(Object.assign(document.createElement('td'), { innerText: title }));
        let td_value = tr.appendChild(Object.assign(document.createElement('td')));
        this.element.appendChild(tr);
        return { tr, td_label, td_value };
    }
}