function reactive(data){
    let proxy = new Proxy(data, handler);
    return proxy;
}

const handler = {
    get(target, key){
        track(target, key);
        let value = Reflect.get(target, key);
        return typeof value === 'object'? reactive(value): value;
    },
    set(target, key, value){
        Reflect.set(target, key, value);
        trigger(target, key);
    }
}

// effect注册栈
const effectLists = [];
/**
 * targetWeakMap{
 *      target: Map{
 *          key: Set()
 *      }
 * }
 */
const targetWeakMap = new WeakMap();

// 依赖收集
function track(target, key){
    const effect = effectLists[effectLists.length - 1];
    let targetMap = targetWeakMap.get(target);
    if (targetMap === undefined){
        targetMap = new Map();
        targetWeakMap.set(target, targetMap);
    }
    let keySet = targetMap.get(key);
    if (keySet === undefined){
        keySet = new Set();
        targetMap.set(key, keySet);
    }
    if (effect){
        if (!keySet.has(effect)){
            keySet.add(effect)
        }
    }    
}

// 依赖更新
function trigger(target, key){
    let targetMap = targetWeakMap.get(target);
    if (targetMap === undefined){
        return;
    }

    let keySet = targetMap.get(key);
    if (keySet === undefined){
        return;
    }
    keySet.forEach(effect=>effect());
}

// 计算属性
function computed(fn){
    const ef = effect(fn, {computed: true, lazy: true});
    return {
        effect: ef,
        get value(){
            return ef();
        }
    }
}


// 收集副作用
function effect(fn, options={}){
    const rFn = createReactEffect(fn, options);
    if (!options.lazy){     //computed不是立即执行
        rFn();
    }  
    return rFn;
}

// 创建响应式副作用
function createReactEffect(fn, options={}){
    function reactiveEffect(...args){
        return run(reactiveEffect, fn, args);
    }
    return reactiveEffect;
}

// 执行副作用
function run(reactiveEffect, fn, args){
    if (!effectLists.includes(reactiveEffect)){
        try{
            effectLists.push(reactiveEffect);
            return fn(...args);
        }finally{
            effectLists.pop();
        }
    }
}