import React from 'react';
import { Redirect, Route } from 'react-router-dom';

export const PrivateRoute = ({
  component: Component,
  isAuthenticated,
  showComponent,
  ...rest
}: any) => {
  console.log('isAuthenticated', isAuthenticated);
  return (
    <Route
      {...rest}
      render={(props) => {
        return isAuthenticated ? (
          <Component {...rest} {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: {
                redirectTo: props.location && props.location.pathname,
              },
            }}
          />
        );
      }}
    />
  );
};
