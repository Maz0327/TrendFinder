// Mini Vue-like framework for Chrome Extension
// This is a simplified reactive system for the popup

export function createApp(options) {
  const state = reactive(options.data());
  const methods = options.methods || {};
  const computed = options.computed || {};
  
  // Make methods bound to state
  const boundMethods = {};
  for (const [key, method] of Object.entries(methods)) {
    boundMethods[key] = method.bind({ ...state, ...boundMethods, ...computedGetters });
  }
  
  // Create computed getters
  const computedGetters = {};
  for (const [key, getter] of Object.entries(computed)) {
    Object.defineProperty(computedGetters, key, {
      get: () => getter.call({ ...state, ...boundMethods })
    });
  }
  
  // Merge everything into context
  const context = { ...state, ...boundMethods, ...computedGetters };
  
  return {
    async mount(selector) {
      const container = document.querySelector(selector);
      
      // Call mounted hook
      if (options.mounted) {
        await options.mounted.call(context);
      }
      
      // Initial render
      render(container, options.template, context);
      
      // Re-render on state changes
      observe(state, () => {
        render(container, options.template, context);
      });
    }
  };
}

// Simple reactivity
function reactive(obj) {
  const handlers = [];
  
  const proxy = new Proxy(obj, {
    get(target, prop) {
      if (typeof target[prop] === 'object' && target[prop] !== null) {
        return reactive(target[prop]);
      }
      return target[prop];
    },
    set(target, prop, value) {
      target[prop] = value;
      handlers.forEach(handler => handler());
      return true;
    }
  });
  
  proxy._handlers = handlers;
  return proxy;
}

function observe(obj, handler) {
  if (obj._handlers) {
    obj._handlers.push(handler);
  }
}

// Simple template renderer
function render(container, template, context) {
  // This is a very basic implementation
  // In production, would use proper Vue 3
  
  let html = template;
  
  // Replace {{ expressions }}
  html = html.replace(/\{\{(.+?)\}\}/g, (match, expression) => {
    return evalInContext(expression.trim(), context);
  });
  
  // Handle v-if
  html = html.replace(/v-if="(.+?)"/g, (match, condition) => {
    const result = evalInContext(condition, context);
    return result ? '' : 'style="display:none"';
  });
  
  // Handle v-for
  const vForRegex = /v-for="(.+?) in (.+?)"/g;
  html = html.replace(vForRegex, (match, item, list) => {
    // This is simplified - real implementation would be more complex
    return '';
  });
  
  container.innerHTML = html;
  
  // Bind events
  bindEvents(container, context);
}

function bindEvents(container, context) {
  // Click events
  container.querySelectorAll('[\\@click]').forEach(el => {
    const handler = el.getAttribute('@click');
    el.addEventListener('click', () => {
      evalInContext(handler, context);
    });
  });
  
  // Model binding
  container.querySelectorAll('[v-model]').forEach(el => {
    const model = el.getAttribute('v-model');
    
    el.addEventListener('input', (e) => {
      setNestedProperty(context, model, e.target.value);
    });
    
    // Set initial value
    el.value = getNestedProperty(context, model) || '';
  });
}

function evalInContext(expression, context) {
  try {
    return new Function(...Object.keys(context), `return ${expression}`)(...Object.values(context));
  } catch (e) {
    console.error('Expression evaluation error:', expression, e);
    return '';
  }
}

function getNestedProperty(obj, path) {
  return path.split('.').reduce((curr, prop) => curr?.[prop], obj);
}

function setNestedProperty(obj, path, value) {
  const parts = path.split('.');
  const last = parts.pop();
  const target = parts.reduce((curr, prop) => curr[prop], obj);
  target[last] = value;
}