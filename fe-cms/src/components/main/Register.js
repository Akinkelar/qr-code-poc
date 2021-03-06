import React, { useState, useEffect, useContext } from 'react';
import { withRouter } from 'react-router-dom';
import { getCurrentDateTimeString } from '../../helpers';
import { GlobalErrorContext } from '../../App';
import { userAccessEndpoint } from '../../config';
import { handleEnterKeyPress } from '../../helpers';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../navigation';

import {
  isEmailValid,
  isEmpty,
  isPasswordLessThan5,
  passwordsMatch
} from '../../services/login.service';

function Register({ history }) {
  const { t } = useTranslation();
  const errorContext = useContext(GlobalErrorContext);

  const [obj, setCredential] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    repeatPassword: '',
    firstNameError: '',
    lastNameError: '',
    passwordError: '',
    emailError: '',
    submitRequest: false,
    registrationSuccess: false
  });

  useEffect(() => {
    const resetState = () => {
      setCredential({
        ...obj,
        firstName: null,
        lastName: null,
        password: null,
        repeatPassword: null,
        firstNameError: null,
        lastNameError: null,
        passwordError: null,
        emailError: null,
        submitRequest: false
      });
    };
    if (!obj.registrationSuccess) return;
    resetState();
    history.push(ROUTES.LOGIN);
  }, [obj, obj.registrationSuccess, history]);

  // BE validation hook
  useEffect(() => {
    if (!obj.submitRequest) return;
    fetch(userAccessEndpoint.REGISTER, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: obj.firstName,
        lastName: obj.lastName,
        email: obj.email,
        password: obj.password,
        registrationTime: getCurrentDateTimeString()
      })
    })
      .then(res => res.json())
      .then(res => {
        if (res.hasOwnProperty('isAlreadyRegistered')) {
          setCredential({
            ...obj,
            passwordError: t('User with given mail already exists'),
            submitRequest: false
          });
          return;
        }
        setCredential({
          ...obj,
          passwordError: '',
          submitRequest: false,
          registrationSuccess: true
        });
      })

      .catch(_ => {
        setCredential({
          ...obj,
          submitRequest: false
        });
        errorContext.dispatchError({
          type: 'global',
          payload: t('Server error ocurred')
        });
      });
  }, [obj, obj.submitRequest, errorContext]);

  const isFrontendValid = () => {
    return (
      isEmailValid(obj.email) &&
      !isEmpty(obj.firstName) &&
      !isEmpty(obj.lastName) &&
      passwordsMatch(obj.password, obj.repeatPassword)
    );
  };

  const validateUser = () => {
    // FE validation
    let firstNameErr = '';
    let lastNameErr = '';
    let passwordErr = '';
    let emailErr = '';

    if (!isFrontendValid()) {
      if (isEmpty(obj.firstName)) {
        firstNameErr = t('Please provide first name');
      }
      if (isEmpty(obj.lastName)) {
        lastNameErr = t('Please provide last name');
      }
      if (isEmpty(obj.email)) {
        emailErr = t('Please provide email');
      } else if (!isEmailValid(obj.email)) {
        emailErr = t('Please provide valid mail');
      }
      if (isEmpty(obj.password)) {
        passwordErr = t('Please provide a password');
      } else if (isPasswordLessThan5(obj.password)) {
        passwordErr = t('Password too short');
      } else if (!passwordsMatch(obj.password, obj.repeatPassword)) {
        passwordErr = t('Passwords do not match');
      }
      setCredential({
        ...obj,
        firstNameError: firstNameErr,
        lastNameError: lastNameErr,
        passwordError: passwordErr,
        emailError: emailErr
      });
      return;
    }
    // triggers BE validation hook
    setCredential({
      ...obj,
      submitRequest: true
    });
  };
  return (
    <>
      <div className="registerFromWrapper card card-signin my-5 ">
        <div className="card-body">
          <h5 className="card-title text-center">{t('Register')}</h5>
          {obj.registrationSuccess && (
            <h4 className="success-container">{t('Successful registration!')}</h4>
          )}
          <div className="form-signin">
            <div className="form-label-group">
              <input
                id="first-name"
                type="text"
                placeholder="First name"
                className="form-control"
                required
                onKeyPress={e => handleEnterKeyPress(() => validateUser(), e.which)}
                onChange={e =>
                  setCredential({
                    ...obj,
                    firstName: e.target.value,
                    firstNameError: null,
                    registrationSuccess: false
                  })
                }
              />
              <label htmlFor="inputEmail">{t('First name')}</label>
            </div>
            {obj.firstNameError && <div className="error-container">{obj.firstNameError}</div>}
            <div className="form-label-group">
              <input
                id="last-name"
                type="text"
                placeholder="last name"
                className="form-control"
                required
                onKeyPress={e => handleEnterKeyPress(() => validateUser(), e.which)}
                onChange={e =>
                  setCredential({
                    ...obj,
                    lastName: e.target.value,
                    lastNameError: null,
                    registrationSuccess: false
                  })
                }
              />
              <label htmlFor="inputEmail">{t('Last name')}</label>
            </div>
            {obj.lastNameError && <div className="error-container">{obj.lastNameError}</div>}
            <div className="form-label-group">
              <input
                id="email"
                type="email"
                placeholder="E-mail"
                className="form-control"
                required
                onKeyPress={e => handleEnterKeyPress(() => validateUser(), e.which)}
                onChange={e =>
                  setCredential({
                    ...obj,
                    email: e.target.value,
                    emailError: null,
                    registrationSuccess: false
                  })
                }
              />
              <label htmlFor="inputEmail">{t('Email address')}</label>
            </div>

            {obj.emailError && <div className="error-container">{obj.emailError}</div>}
            <div id="register-password-container">
              <div className="form-label-group">
                <input
                  id="password"
                  type="password"
                  placeholder="Password"
                  className="form-control"
                  onKeyPress={e => handleEnterKeyPress(() => validateUser(), e.which)}
                  onChange={e =>
                    setCredential({
                      ...obj,
                      password: e.target.value,
                      passwordError: null,
                      registrationSuccess: false
                    })
                  }
                  required
                />
                <label htmlFor="inputPassword">{t('Password')}</label>
              </div>
              <div className="form-label-group">
                <input
                  id="repeat-password"
                  type="password"
                  placeholder="Password"
                  className="form-control"
                  onKeyPress={e => handleEnterKeyPress(() => validateUser(), e.which)}
                  onChange={e =>
                    setCredential({
                      ...obj,
                      repeatPassword: e.target.value,
                      passwordError: null,
                      registrationSuccess: false
                    })
                  }
                  required
                />
                <label htmlFor="inputPassword">{t('Confirm password')}</label>
              </div>
              {obj.passwordError && <div className="error-container">{obj.passwordError}</div>}
            </div>

            {obj.submitRequest && <div className="loader"></div>}
            <button
              type="submit"
              className="btn btn-lg btn-primary btn-block text-uppercase adminBtn"
              disabled={obj.submitRequest}
              onClick={() => validateUser()}
            >
              {t('Confirm registration')}
            </button>
            <hr className="my-4" />
          </div>
        </div>
      </div>
    </>
  );
}

export default withRouter(Register);
