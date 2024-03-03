// @ts-check
import { SelectControl } from "./SelectControl.js";
/**
 * @typedef { 'particles_count' | 'pheromone_decay_factor' | 'step_size' | 'direction_change_angle' | 'viewing_distance' | 'emission_intensity' } NumberParameter
 * @typedef { 'color_blending' | 'pheromones_model' | 'start_state' | 'blur_type' | 'movement_model' } StringParameter
 * @typedef { 'show_pheromones' } BooleanParameter
 * @typedef { 'fc' | 'mr' | 'c' | 'r' } StartState
 * @typedef { 'r01' | '1of3' | 'b' } SmellFunction
 * @typedef { 'argb' | 's' | 'sn' } PheromonesModel
 * @typedef { '0' | '' | 'b' } ColorBlending
 * @typedef { Record<NumberParameter, { value: number, changed: boolean }> 
 * & Record<BooleanParameter, { value: boolean, changed: boolean }> 
 * & Record<StringParameter, { value: string, changed: boolean }>
 * & { start_state: { value: StartState, changed: boolean } }
 * & { movement_model: { value: import('./UpdateParticlesProgram').MovementModel, changed: boolean } }
 * & { blur_type: { value: import('./UpdatePheromoneProgram.js').BlurType, changed: boolean } }
 * & { pheromones_model: { value: PheromonesModel, changed: boolean } } } Parameters
 */
export class ParametersPanel
{
    static Color_Blending = { 0: { name: 'Disabled' }, 'a': { name: 'SRC_ALPHA' } };
    static Pheromones_Model = { 'argb': { name: 'Antagonistyczne RGB' }, 's': { name: 'Pojedynczy' } }; // , 'sn': { name: 'Pojedynczy + neutralny' }
    static Start_State = { 'mr': { name: 'Pierścień z ruchem do centrum' }, 'fc': { name: 'Pełne koło z ruchem do centrum' }, 'c': { name: 'Obwód koła z ruchem do centrum' }, 'r': { name: 'Losowo' } };
    static Movement_Model = { 'simple2': { name: 'Dwupunktowy.' }, 'simple3': { name: 'Trójpunktowy' }, 'simple5': { name: 'Pięciopunktowy' } };
    static Blur_Type = { 'off': { name: 'Brak rozpraszania' }, '3': { name: 'Gaussian 3x3' }, '5': { name: 'Gaussian 5x5' } };
    /** @type {Parameters} */
    static Defaults = 
    {
        particles_count: { value: 100000, changed: true },
        pheromone_decay_factor: { value: 0.97, changed: true },
        step_size: { value: 1.7, changed: true },
        direction_change_angle: { value: 5, changed: true }, // 1313131345364123
        viewing_distance: { value: 4.1, changed: true },
        pheromones_model: { value: 's', changed: true },
        emission_intensity: { value: 0.05, changed: true },
        show_pheromones: { value: true, changed: true },
        color_blending: { value: 'a', changed: true },
        start_state: { value: 'mr', changed: true },
        movement_model: { value: 'simple5', changed: true },
        blur_type: { value: 'off', changed: true },
    };
    constructor()
    {
        this.parameters = ParametersPanel.Defaults;
        this.parameters_source = new URLSearchParams(window.location.search);
        this.element = document.createElement('table');

        this.controls =
        {
            particles_count: this._createInputNumberControl({ name: 'particles_count', short_name: 'pc', title: 'Liczba cząsteczek' }),
            start_state: this._addRowWithSelectControl({ name: 'start_state', short_name: 's', title: 'Stan początkowy', items: ParametersPanel.Start_State }),
            pheromones_model: this._addRowWithSelectControl({ name: 'pheromones_model', short_name: 'pm', title: 'Model feromonów', items: ParametersPanel.Pheromones_Model }),
            // this.smell_function = this._createInputTextControl({ name: 'smell_function', short_name: 'sf', title: 'Model feromonów' }, { disabled: 'disabled' });
            pheromone_decay_factor: this._createInputNumberControl({ name: 'pheromone_decay_factor', short_name: 'pdf', title: 'Współczynnik zanikania feromonu' }, { step: 0.001 }),
            emission_intensity: this._createInputNumberControl({ name: 'emission_intensity', short_name: 'ei', title: 'Współczynnik emisji feromonu' }, { min: 0.001, max: 1, step: 0.001 }),
            movement_model: this._addRowWithSelectControl({ name: 'movement_model', short_name: 'mm', title: 'Model ruchu cząsteczki', items: ParametersPanel.Movement_Model, comment: 'Wymaga ponownego uruchomienia strony.' }),
            step_size: this._createInputNumberControl({ name: 'step_size', short_name: 'ss', title: 'Długość kroku' }, { step: 0.1 }),
            direction_change_angle: this._createInputNumberControl({ name: 'direction_change_angle', short_name: 'dca', title: 'Kąt zmiany kierunku' }, { min: 0, max: 90, step: 0.1 }),
            viewing_distance: this._createInputNumberControl({ name: 'viewing_distance', short_name: 'vd', title: 'Odległość widzenia' }, { min: 0.5, max: 50, step: 0.1 }),
            show_pheromones: this._createInputCheckboxControl({ name: 'show_pheromones', short_name: 'sp', title: 'Pokaż mapę feromonów' }),
            color_blending: this._addRowWithSelectControl({ name: 'color_blending', short_name: 'cb', title: 'Funkcja mieszania kolorów', items: ParametersPanel.Color_Blending }),
            blur_type: this._addRowWithSelectControl({ name: 'blur_type', short_name: 'bt', title: 'Sposób rozproszenia feromonów', items: ParametersPanel.Blur_Type, comment: 'Wymaga ponownego uruchomienia strony.' }),
        }

        this.reset = true;
        this.reset_button = Object.assign(document.createElement('button'), { innerText: "Zastosuj" });
        this.reset_button.addEventListener('click', () => this.reset = true);
        this.controls.particles_count.elements.td_value.appendChild(this.reset_button);

        this.link = this._addRow('Link do bieżących ustawień', '');
        // @ts-ignore
        this.link.td_value.parentElement.colSpan = 2;
        // @ts-ignore
        this.link.td_value.parentElement.id = 'link';
        this.link_a = document.createElement('a');
        this.link.td_value.appendChild(this.link_a);
        // this.link.td_value.addEventListener('click', () => navigator.clipboard.writeText(this.link.td_value.innerText));
        this._updateLink();
    }
    /**
     * @returns {(index: number) => [number, number, number]}
     */
    getPheromonesModelFunction()
    {
        switch (this.parameters.pheromones_model.value)
        {
            case 's': 
                /** @type {[number, number, number][]} */
                return () => [1, 1, 1];
            // case 'b': 
            //     /** @type {[number, number, number][]} */
            //     return () => [0, 0, 1];
            // case 'r01': 
            //     /** @type {[number, number, number][]} */
            //     return () => [Math.random(), 0, 1];
            case 'argb': 
                /** @type {[number, number, number][]} */
                let colors = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
                return i => colors[i % 3];
            default: return () => [0, 0, 1];
        }
    }
    _updateLink()
    {
        let { origin, pathname } = window.location;
        let parameters = Object.values(this.controls);
        let url_parameters = [];
        url_parameters.push(...parameters.map(({ value_serializer, short_name }) => `${short_name}=${value_serializer.get()}`));
        this.link_a.innerText = `${origin}${pathname}?${url_parameters.join('&')}`;
        this.link_a.href = this.link_a.innerText;
    }
    /** @type {(name: NumberParameter, short_name: string) => number} */
    _getNumberParameterValue(name, short_name)
    {
        let default_value = this.parameters[name].value;
        let param_value = this.parameters_source.get(short_name);
        if (!param_value) return default_value;
        let value = Number.parseFloat(param_value);
        if (Number.isNaN(value)) return default_value;
        return value;
    };
    /** @type {(name: StringParameter, short_name: string) => string} */
    _getStringParameterValue(name, short_name)
    {
        let default_value = this.parameters[name].value;
        let param_value = this.parameters_source.get(short_name);
        if (!param_value) return default_value;
        return param_value;
    };
    /** @type {(name: BooleanParameter, short_name: string) => boolean} */
    _getBooleanParameterValue(name, short_name)
    {
        let default_value = this.parameters[name].value;
        let param_value = this.parameters_source.get(short_name);
        if (!param_value) return default_value;
        let value = Number.parseInt(param_value);
        if (Number.isNaN(value)) return default_value;
        return value == 1;
    };
    /**
     * @param {{ name: BooleanParameter, short_name: string, title: string, comment?: string }} param0 
     * @param {{}} [input_properties]
     */
    _createInputCheckboxControl({ name, short_name, title, comment }, input_properties)
    {
        let initial_value = this._getBooleanParameterValue(name, short_name);
        /** @type {HTMLInputElement} */
        let input = Object.assign(document.createElement('input'), { type: 'checkbox', ...input_properties });
        let value_serializer = { get() { return input.checked ? '1' : '0' }, set(/** @type {string} */ value) { input.checked = value == '1' } };
        let value_setter = (/** @type {boolean} */ value) => { input.checked = value; this.parameters[name].value = value; this.parameters[name].changed = true; }
        value_setter(initial_value);
        let value = { get() { return input.checked }, set: value_setter };
        let elements = this._addRow(title, comment ?? '', input);
        input.addEventListener('change', () => { this.parameters[name].value = input.checked; this.parameters[name].changed = true; this._updateLink(); });
        return { short_name, elements, value_serializer, value };
    }
    /**
     * @param {{ name: NumberParameter, short_name: string, title: string, comment?: string }} param0 
     * @param {{}} [input_properties]
     */
    _createInputNumberControl({ name, short_name, title, comment }, input_properties)
    {
        let initial_value = this._getNumberParameterValue(name, short_name);
        /** @type {HTMLInputElement} */
        let input = Object.assign(document.createElement('input'), { type: 'number', ...input_properties });
        let value_serializer = { get() { return input.value }, set(/** @type {string} */ value) { input.value = value } };
        let value_setter = (/** @type {number} */ value) => { input.valueAsNumber = value; this.parameters[name].value = input.valueAsNumber; this.parameters[name].changed = true; }
        value_setter(initial_value);
        let value = { get() { return input.valueAsNumber }, set: value_setter };
        // let control = this._addRowWithInputControl({ short_name, title, comment, input, value });
        let elements = this._addRow(title, comment ?? '', input);
        input.addEventListener('change', () => { this.parameters[name].value = input.valueAsNumber; this.parameters[name].changed = true; this._updateLink(); });
        return { short_name, elements, value_serializer, value };
    }
    /**
     * @param {{ name: StringParameter, short_name: string, title: string, comment?: string }} param0 
     * @param {{}} [input_properties]
     */
    _createInputTextControl({ name, short_name, title, comment }, input_properties)
    {
        let initial_value = this._getStringParameterValue(name, short_name);
        /** @type {HTMLInputElement} */
        let input = Object.assign(document.createElement('input'), { type: 'text', ...input_properties });
        let value_serializer = { get() { return input.value }, set(/** @type {string} */ value) { input.value = value } };
        // let control = this._addRowWithInputControl({ short_name, title, comment, input, value });
        let elements = this._addRow(title, comment ?? '', input);
        input.addEventListener('change', () => { this.parameters[name].value = input.value; this.parameters[name].changed = true; this._updateLink(); }); 
        return { short_name, elements, value_serializer };
    }
    /**
     * @param {{ short_name: string, title: string, comment?: string, input: HTMLInputElement, value: { get: () => string, set: (value: string) => void } }} param0 
     */
    _addRowWithInputControl({ short_name, title, comment, input, value })
    {
        let elements = this._addRow(title, comment ?? '', input);
        let control = { short_name, elements, value };
        return control;
    }
    /**
     * @template {string} T
     * @param {{ name: StringParameter, short_name: string, title: string, comment?: string, items: Record<T, { name: string }> }} param0 
     */
    _addRowWithSelectControl({ name, short_name, title, comment, items })
    {
        /** @type {T} */
        // @ts-ignore
        let initial_value = this._getStringParameterValue(name, short_name);
        let input = new SelectControl(items);
        let value_serializer = { get: () => input.value, set: (/** @type {string} */ v) => input.element.value = v };
        let value_setter = (/** @type {string} */ value) => { input.element.value = value; this.parameters[name].value = input.value; this.parameters[name].changed = true; }
        value_setter(initial_value);
        let elements = this._addRow(title, comment ?? '', input.element);
        input.element.addEventListener('change', () => { this.parameters[name].value = input.value; this.parameters[name].changed = true; this._updateLink(); }); 
        return { short_name, elements, value_serializer };
    }
    /**
     * @param {string} title
     * @param {string} comment 
     * @param {Element} [td_value_child]
     */
    _addRow(title, comment, td_value_child)
    {
        let tr = document.createElement('tr');
        /** @type {HTMLTableCellElement} */
        let td_label = tr.appendChild(Object.assign(document.createElement('td'), { innerText: title }));
        /** @type {HTMLTableCellElement} */
        let td_value = tr.appendChild(Object.assign(document.createElement('td')));
        td_value = td_value.appendChild(Object.assign(document.createElement('div')));
        /** @type {HTMLTableCellElement} */
        let td_comment = tr.appendChild(Object.assign(document.createElement('td'), { innerText: comment }));
        td_comment.classList.add('comment');
        if (td_value_child) td_value.appendChild(td_value_child);
        this.element.appendChild(tr);
        return { tr, td_label, td_value, td_comment };
    }
}