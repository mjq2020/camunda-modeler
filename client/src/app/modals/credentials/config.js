/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

import { getFieldKey } from './credentialForm';

/**
 * Build the cluster-variable value from the entered field values, keyed by each
 * field's binding name (falling back to its id). Empty values are omitted.
 *
 * @param {Array<Object>} fields
 * @param {Object<string, string>} values
 * @returns {Object<string, string>}
 */
export function buildConfig(fields, values) {
  const config = {};

  for (const field of fields) {
    const key = field.binding?.name ?? field.id;
    const value = values[getFieldKey(field)];

    if (value !== undefined && value !== '') {
      config[key] = value;
    }
  }

  return config;
}

/**
 * Parse a stored cluster-variable value (object or JSON-serialized string) into a
 * plain map. A value that no longer parses reads as empty rather than throwing.
 *
 * @param {Object|string|null} value
 * @returns {Object<string, unknown>}
 */
export function parseConfig(value) {
  if (!value) {
    return {};
  }

  if (typeof value === 'object') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return {};
  }
}

/**
 * Map a stored cluster-variable value back to form field values, keyed by field id.
 *
 * @param {Array<Object>} properties
 * @param {Object|string|null} value
 * @returns {Object<string, string>}
 */
export function toFieldValues(properties, value) {
  const config = parseConfig(value);

  const values = {};

  for (const property of properties) {
    const fieldKey = property && getFieldKey(property);

    if (!fieldKey) {
      continue;
    }

    const bindingKey = property.binding?.name ?? property.id;

    if (config[bindingKey] !== undefined) {
      values[fieldKey] = String(config[bindingKey]);
    }
  }

  return values;
}

/**
 * Whether a field must be filled in.
 *
 * @param {Object} field
 * @returns {boolean}
 */
export function isFieldRequired(field) {
  return field.optional === false || field.constraints?.notEmpty === true;
}
