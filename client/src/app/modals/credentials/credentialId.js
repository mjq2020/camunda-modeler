/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

const FALLBACK = 'credential';

/**
 * Derive the cluster-variable name a credential is stored under. It becomes the
 * FEEL handle (`=camunda.vars.env.<id>`) and is fixed once created, so it must
 * satisfy the `^[a-z_][a-z0-9_]*$` shape.
 *
 * @param {string} displayName
 * @param {string} suffix
 * @returns {string}
 */
export function toCredentialId(displayName, suffix) {
  const slug = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return `${ /^[a-z_]/.test(slug) ? slug : FALLBACK }_${ suffix }`;
}
