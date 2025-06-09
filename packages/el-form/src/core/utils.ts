// Core utility functions
export function setNestedValue(obj: any, path: string, value: any): any {
  const result = { ...obj };

  // Handle array notation like employees[0].name
  const normalizedPath = path.replace(/\[(\d+)\]/g, ".$1");
  const keys = normalizedPath.split(".").filter((key) => key !== "");
  let current = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];

    // Check if current key is numeric (array index)
    if (!isNaN(Number(key))) {
      // We're accessing an array index, current should already be an array
      if (!Array.isArray(current)) {
        current = [];
      }
      // Ensure we have a copy of the array
      if (!current[Number(key)]) {
        current[Number(key)] = !isNaN(Number(nextKey)) ? [] : {};
      } else {
        current[Number(key)] = Array.isArray(current[Number(key)])
          ? [...current[Number(key)]]
          : { ...current[Number(key)] };
      }
      current = current[Number(key)];
    } else {
      // Check if next key is an array index
      if (!isNaN(Number(nextKey))) {
        if (!Array.isArray(current[key])) {
          current[key] = [];
        } else {
          current[key] = [...current[key]];
        }
      } else {
        if (typeof current[key] !== "object" || current[key] === null) {
          current[key] = {};
        } else {
          current[key] = { ...current[key] };
        }
      }
      current = current[key];
    }
  }

  const finalKey = keys[keys.length - 1];
  if (!isNaN(Number(finalKey))) {
    current[Number(finalKey)] = value;
  } else {
    current[finalKey] = value;
  }

  return result;
}

export function getNestedValue(obj: any, path: string): any {
  // Handle array notation like employees[0].name
  const normalizedPath = path.replace(/\[(\d+)\]/g, ".$1");
  const keys = normalizedPath.split(".").filter((key) => key !== "");

  return keys.reduce((current, key) => {
    if (current === null || current === undefined) return undefined;

    if (!isNaN(Number(key))) {
      return Array.isArray(current) ? current[Number(key)] : undefined;
    }

    return current[key];
  }, obj);
}

export function removeArrayItem(obj: any, path: string, index: number): any {
  const result = { ...obj };

  // Handle array notation like employees[0].name
  const normalizedPath = path.replace(/\[(\d+)\]/g, ".$1");
  const keys = normalizedPath.split(".").filter((key) => key !== "");
  let current = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];

    if (!isNaN(Number(key))) {
      // Array index
      if (Array.isArray(current)) {
        current[Number(key)] = Array.isArray(current[Number(key)])
          ? [...current[Number(key)]]
          : { ...current[Number(key)] };
        current = current[Number(key)];
      }
    } else {
      // Object key
      if (typeof current[key] === "object" && current[key] !== null) {
        current[key] = Array.isArray(current[key])
          ? [...current[key]]
          : { ...current[key] };
      }
      current = current[key];
    }
  }

  const arrayKey = keys[keys.length - 1];
  if (!isNaN(Number(arrayKey))) {
    // Removing from a numeric index (shouldn't happen with this function)
    if (Array.isArray(current)) {
      current.splice(Number(arrayKey), 1);
    }
  } else {
    // Removing from an array property
    if (Array.isArray(current[arrayKey])) {
      current[arrayKey] = [...current[arrayKey]];
      current[arrayKey].splice(index, 1);
    }
  }

  return result;
}
