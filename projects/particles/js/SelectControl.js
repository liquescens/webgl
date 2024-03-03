// @ts-check
/**
 * @template {string} TChoice
 */
export class SelectControl
{
    /**
     * @param {Record<TChoice, { name: string }>} items
     */
    constructor(items)
    {
        this.element = document.createElement('select');
        for (let [value, { name }] of Object.entries(items))
        {
            let option = document.createElement('option');
            option.innerText = name;
            option.value = value;
            this.element.appendChild(option);
        }
    }
    /**
     * @return {TChoice}
     */
    get value()
    {
        // @ts-ignore
        return this.element.value;
    }
}