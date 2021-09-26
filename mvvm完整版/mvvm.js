import Observer from './observe.js';
import Compile from './compile.js';

class MVVM{
    /**
     * @param $options
     * $el 模版挂载的位置
     * data MVVM实例驱动试图的数据 
     */
    constructor($options){
        this._data = $options.data;
        // 把_data内部的属性代理到this上
        this._proxy(this._data);
        // 通过observe劫持data
        new Observer(this._data);

        // 挂载$el
        this.$compile = new Compile($options.el || document.body, this)
    }
    // 使用this.property代理this._data.property
    _proxy(data){
        for (let key in data){
            Object.defineProperty(this, key, {
                get(){
                    return this._data[key]
                },
                set(newValue){
                    this._data[key] = newValue;
                }
            })
        }
    }
}

export default MVVM;
