/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

/**
 * The stable per-field key used for form values: the property id when present,
 * otherwise its binding name (configuration-template fields may omit `id`).
 *
 * @param {Object} property
 * @returns {string|undefined}
 */
export function getFieldKey(property) {
  return property.id ?? property.binding?.name;
}

/**
 * Seed the form values from each field's default.
 *
 * @param {Array<Object>} properties
 * @returns {Object<string, string>}
 */
export function getInitialFieldValues(properties) {
  const values = {};

  for (const property of properties) {
    const key = property && getFieldKey(property);

    if (key) {
      values[key] = property.value ?? '';
    }
  }

  return values;
}

/**
 * Evaluate a configuration-template field `condition` against the current values.
 *
 * @param {Object} [condition]
 * @param {Object<string, string>} values
 * @returns {boolean}
 */
export function isConditionMet(condition, values) {
  if (!condition) {
    return true;
  }

  if (Array.isArray(condition.allMatch)) {
    return condition.allMatch.every(nested => isConditionMet(nested, values));
  }

  if (Array.isArray(condition.oneMatch)) {
    return condition.oneMatch.some(nested => isConditionMet(nested, values));
  }

  if (condition.property !== undefined && Array.isArray(condition.oneOf)) {
    return condition.oneOf.includes(values[condition.property] ?? '');
  }

  if (condition.property !== undefined) {
    return (values[condition.property] ?? '') === (condition.equals ?? '');
  }

  return true;
}

/**
 * Filter the fields whose condition is currently met.
 *
 * @param {Array<Object>} properties
 * @param {Object<string, string>} values
 * @returns {Array<Object>}
 */
export function getVisibleProperties(properties, values) {
  return properties.filter(property => isConditionMet(property.condition, values));
}
