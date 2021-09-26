class Observer{
    constructor(data){
        this.data = data;
        for (let key in data){
            this.defineReactive(data, key, data[key]);
        }
    }

    defineReactive(object, key, value){
        if (Object.prototype.toString.call(value) === '[object Object]' && value !== null) {
            for (let _key in value) {
                this.defineReactive(value, _key, value[_key]);
            }
        }
        Object.defineProperty(object, key, {
            get(){
                console.log(`劫持了${key}的get方法，返回值是${value}`);
                return value;
            },
            set(newValue){
                console.log(`劫持了${key}的值是${newValue}`);
                value = newValue;
                // 通知订阅者
                dep.notify();
            }
        })
    }
}

export default Observer;