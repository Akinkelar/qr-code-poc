import React, { useState, useEffect, useContext } from 'react';
import { withRouter } from 'react-router-dom';
import { GlobalErrorContext } from '../../App';
import { parseCookie, parseJwt } from '../../helpers';

import {
  isEmpty,
  isPasswordLessThan5,
  passwordsMatch
} from '../../services/login.service';

function ChangePassword() {
  const errorContext = useContext(GlobalErrorContext);
  const [obj, setCredential] = useState({
    currentPassword: null,
    userId: null,
    currentPasswordError: null,
    newPassword: null,
    repeatPassword: null,
    changePasswordError: null,
    submitRequest: false,
    changePasswordSuccess: false
  });

  const resetState = () => {
    setCredential({
      ...obj,
      currentPassword: null,
      currentPasswordError: null,
      newPassword: null,
      repeatPassword: null,
      changePasswordError: null,
      submitRequest: false,
      changePasswordSuccess: false
    });
  };

  useEffect(() => {
    if (!obj.changePasswordSuccess) return;
    resetState();
  }, [obj.changePasswordSuccess]);

  // BE validation hook
  useEffect(() => {
    if (!obj.submitRequest) return;
    fetch('/change-password', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentPassword: obj.currentPassword,
        newPassword: obj.newPassword,
        id: parseJwt(parseCookie('token')).id
      })
    })
      .then(res => {
        if (res.ok || res.status === 401) {
          return res.json();
        }
        throw new Error();
      })
      .then(res => {
        res.success
          ? setCredential({
              ...obj,
              changePasswordError: '',
              submitRequest: false,
              changePasswordSuccess: true
            })
          : setCredential({
              ...obj,
              changePasswordError: 'Your current password is wrong, try again',
              submitRequest: false,
              changePasswordSuccess: false
            });
      })

      .catch(_ => {
        setCredential({
          ...obj,
          submitRequest: false
        });
        errorContext.dispatchError({
          type: 'global',
          payload: 'Server error ocurred 1'
        });
      });
  }, [obj.submitRequest]);

  const isFrontendValid = () => {
    return (
      !isEmpty(obj.currentPassword) &&
      !isEmpty(obj.newPassword) &&
      passwordsMatch(obj.newPassword, obj.repeatPassword)
    );
  };

  const validateUser = () => {
    // FE validation
    let currentPasswordErr = '';
    let changePasswordErr = '';

    if (!isFrontendValid()) {
      if (isEmpty(obj.currentPassword)) {
        currentPasswordErr = 'Please provide a password';
      } else if (isPasswordLessThan5(obj.currentPassword)) {
        currentPasswordErr = 'Password too short';
      }
      if (isEmpty(obj.newPassword || obj.repeatPassword)) {
        changePasswordErr = 'Please provide a password';
      } else if (isPasswordLessThan5(obj.newPassword || obj.repeatPassword)) {
        changePasswordErr = 'Password too short';
      } else if (!passwordsMatch(obj.newPassword, obj.repeatPassword)) {
        changePasswordErr = 'Passwords do not match';
      }

      setCredential({
        ...obj,
        currentPasswordError: currentPasswordErr,
        changePasswordError: changePasswordErr
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
    <div className="container">
      <div className="card card-signin my-5 center">
        <div className="card-body">
          <h5 className="card-title text-center">Change password</h5>
          {obj.changePasswordSuccess && (
            <h4 className="success-container">Successful Change!</h4>
          )}
          <div className="form-signin">
            <div className="form-label-group">
              <input
                type="password"
                placeholder="Password"
                className="form-control"
                onChange={e =>
                  setCredential({
                    ...obj,
                    currentPassword: e.target.value,
                    currentPasswordError: null
                  })
                }
                required
              />
              <label htmlFor="inputPassword">Current password</label>
            </div>
            {obj.currentPasswordError && (
              <div className="error-container">{obj.currentPasswordError}</div>
            )}
            <div id="change-password-container">
              <div className="form-label-group">
                <input
                  type="password"
                  placeholder="Password"
                  className="form-control"
                  onChange={e =>
                    setCredential({
                      ...obj,
                      newPassword: e.target.value,
                      passwordError: null
                    })
                  }
                  required
                />
                <label htmlFor="inputPassword">New password</label>
              </div>
              <div className="form-label-group">
                <input
                  type="password"
                  placeholder="Password"
                  className="form-control"
                  onChange={e =>
                    setCredential({
                      ...obj,
                      repeatPassword: e.target.value,
                      changePasswordError: null
                    })
                  }
                  required
                />
                <label htmlFor="inputPassword">Repeat password</label>
              </div>
              {obj.changePasswordError && (
                <div className="error-container">{obj.changePasswordError}</div>
              )}
            </div>

            {obj.submitRequest && <div className="loader"></div>}
            <button
              type="submit"
              className="btn btn-lg btn-primary btn-block text-uppercase"
              disabled={obj.submitRequest}
              onClick={() => validateUser()}
            >
              Confirm change
            </button>
            <hr className="my-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default withRouter(ChangePassword);
