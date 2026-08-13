/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

import React, { PureComponent } from 'react';

import {
  Modal
} from '../../../shared/ui';

import {
  getFieldKey,
  getVisibleProperties
} from './credentialForm';

import {
  isFieldRequired
} from './config';

import {
  toCredentialId
} from './credentialId';

const TITLES = {
  create: 'Add credential',
  edit: 'Edit credential',
  upgrade: 'Upgrade credential'
};

const SUBMIT_LABELS = {
  create: 'Create and select',
  edit: 'Save',
  upgrade: 'Save'
};

class CredentialsModal extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      displayName: props.displayName || '',
      values: props.initialValues || {},
      submitting: false,
      error: null
    };

    // Stable for the lifetime of the dialog so the derived id does not change
    // while typing.
    this.suffix = Math.random().toString(36).slice(2, 6);
  }

  getProperties() {
    const { configurationTemplate } = this.props;

    return (configurationTemplate && configurationTemplate.properties) || [];
  }

  getVisibleFields() {
    return getVisibleProperties(this.getProperties(), this.state.values);
  }

  getCredentialName() {
    const { mode, credentialName } = this.props;

    if (mode === 'create') {
      return toCredentialId(this.state.displayName, this.suffix);
    }

    return credentialName || '';
  }

  canSubmit() {
    const { displayName, values, submitting } = this.state;

    if (submitting || !displayName.trim()) {
      return false;
    }

    return this.getVisibleFields().every(
      field => !isFieldRequired(field) || (values[ getFieldKey(field) ] || '').trim() !== ''
    );
  }

  handleFieldChange(id, value) {
    this.setState(state => ({
      values: {
        ...state.values,
        [ id ]: value
      }
    }));
  }

  handleSubmit = async () => {
    this.setState({ submitting: true, error: null });

    try {
      await this.props.onSubmit({
        displayName: this.state.displayName.trim(),
        name: this.getCredentialName(),
        values: this.state.values
      });

      // on success the parent unmounts this modal
    } catch (error) {
      this.setState({
        submitting: false,
        error: error.message || 'Something went wrong.'
      });
    }
  };

  renderField(field) {
    const { values } = this.state;

    const fieldKey = getFieldKey(field);
    const id = `credential-field-${ fieldKey }`;
    const value = values[ fieldKey ] ?? '';
    const required = isFieldRequired(field);

    return (
      <div className="form-group" key={ fieldKey }>
        <label htmlFor={ id }>
          { field.label || fieldKey }
          { required && <span> *</span> }
        </label>
        {
          field.type === 'Dropdown'
            ? (
              <select
                id={ id }
                className="form-control"
                value={ value }
                onChange={ event => this.handleFieldChange(fieldKey, event.target.value) }
              >
                { field.optional && <option value=""></option> }
                {
                  (field.choices || []).map(choice => (
                    <option key={ choice.value } value={ choice.value }>{ choice.name }</option>
                  ))
                }
              </select>
            )
            : (
              <input
                id={ id }
                className="form-control"
                type="text"
                value={ value }
                onChange={ event => this.handleFieldChange(fieldKey, event.target.value) }
              />
            )
        }
        { field.description && <p className="form-text">{ field.description }</p> }
      </div>
    );
  }

  render() {
    const { mode, onClose } = this.props;
    const { displayName, submitting, error } = this.state;

    const name = this.getCredentialName();

    return (
      <Modal onClose={ submitting ? null : onClose }>

        <Modal.Title>{ TITLES[ mode ] || TITLES.create }</Modal.Title>

        <Modal.Body>
          <div className="form-group">
            <label htmlFor="credential-display-name">Name *</label>
            <input
              id="credential-display-name"
              className="form-control"
              type="text"
              value={ displayName }
              onChange={ event => this.setState({ displayName: event.target.value }) }
            />
            { name && (
              <p className="form-text">
                Referenced as <code>=camunda.vars.env.{ name }</code>
              </p>
            ) }
          </div>

          { this.getVisibleFields().map(field => this.renderField(field)) }

          { error && <p className="credentials-modal-error" role="alert">{ error }</p> }
        </Modal.Body>

        <Modal.Footer>
          <div className="buttonDiv">
            <button className="btn btn-secondary" onClick={ onClose } disabled={ submitting }>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={ this.handleSubmit } disabled={ !this.canSubmit() }>
              { SUBMIT_LABELS[ mode ] || SUBMIT_LABELS.edit }
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default CredentialsModal;
