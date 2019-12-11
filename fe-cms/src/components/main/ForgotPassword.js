import React, { useState, useEffect, useContext } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { isEmailValid, isEmpty } from '../../services/login.service';
import { GlobalErrorContext } from '../../App';
import { userAccessEndpoint } from '../../config';
import { handleEnterKeyPress } from '../../helpers';

function ForgotPassword() {
  const errorContext = useContext(GlobalErrorContext);
  const [obj, setCredential] = useState({
    email: '',
    emailError: '',
    submitRequest: false,
    forgotPasswordSuccess: false
  });

  const resetState = () => {
    setCredential({
      ...obj,
      email: '',
      emailError: '',
      submitRequest: false
    });
  };

  const isFrontendValid = () => {
    return !!isEmailValid(obj.email);
  };

  const onSubmitHandler = () => {
    // FE validation
    let emailErr = '';

    if (!isFrontendValid()) {
      if (isEmpty(obj.email)) {
        emailErr = 'Please provide email';
      } else if (!isEmailValid(obj.email)) {
        emailErr = 'Please provide valid mail';
      }

      setCredential({
        ...obj,
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

  // Effect hooks
  useEffect(() => {
    if (!obj.forgotPasswordSuccess) return;
    resetState();
  }, [obj.forgotPasswordSuccess]);

  // BE validation hook
  useEffect(() => {
    if (!obj.submitRequest) return;

    fetch(userAccessEndpoint.FORGOT_PASSWORD, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: obj.email
      })
    })
      .then(res => {
        if (res.ok || res.status === 401) {
          return res.json();
        }
        throw new Error();
      })
      .then(res => {
        return res.success
          ? setCredential({
              ...obj,
              submitRequest: false,
              forgotPasswordSuccess: true
            })
          : setCredential({
              ...obj,
              submitRequest: false,
              emailError: `Email doesn't exist in the database`
            });
      })

      .catch(_ => {
        setCredential({
          ...obj,
          submitRequest: false
        });
        errorContext.dispatchError({
          type: 'global',
          payload: 'Server error ocurred'
        });
      });
  }, [obj.submitRequest]);

  return (
    <div>
      <div
        className="userFromWrapper card card-signin my-5"
        style={{ opacity: obj.submitRequest ? 0.4 : 1 }}
      >
        <div className="card-body">
          <h5 className="card-title text-center">Forgot Password</h5>
          {obj.forgotPasswordSuccess && (
            <h4 className="success-container">Password successfully sent!</h4>
          )}
          <div className="form-signin">
            <div className="form-label-group">
              <input
                id="forgot-section-email"
                type="email"
                value={obj.email}
                className="form-control"
                placeholder="Enter your email"
                required
                onKeyPress={e => handleEnterKeyPress(() => onSubmitHandler(), e.which)}
                onChange={e =>
                  setCredential({
                    ...obj,
                    forgotPasswordSuccess: false,
                    email: e.target.value,
                    emailError: ''
                  })
                }
              />
            </div>

            {obj.emailError && <div className="error-container">{obj.emailError}</div>}
            {obj.submitRequest && <div className="loader"></div>}
            <button
              type="submit"
              className="btn btn-lg btn-primary btn-block text-uppercase"
              disabled={obj.submitRequest}
              onClick={() => onSubmitHandler()}
            >
              Send Password to email
            </button>

            <Link to={'/login'} className="btn btn-block backToLogin">
              <i className="fas fa-chevron-left fa-2x"></i>
              <span>Back to login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withRouter(ForgotPassword);
