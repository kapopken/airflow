/*!
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import nock from 'nock';
import axios from 'axios';

import Login from 'views/Login';
import App from 'App';
import AuthProvider from 'auth/AuthProvider';

import { url, defaultHeaders, QueryWrapper } from './utils';

axios.defaults.adapter = require('axios/lib/adapters/http');

test('App shows Login screen by default', () => {
  const { getByText } = render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );

  expect(getByText('Password')).toBeInTheDocument();
});

describe('test login component', () => {
  test('Button is disabled when there is no username or password', () => {
    const { getByTestId } = render(
      <Login />,
    );
    const button = getByTestId('submit');

    expect(button).toBeDisabled();
  });

  test('Button is clickable only when username and password exist', () => {
    const { getByTestId } = render(
      <Login />,
    );

    const button = getByTestId('submit');
    const username = getByTestId('username');
    const password = getByTestId('password');

    fireEvent.change(username, { target: { value: 'admin' } });
    expect(button).toBeDisabled();
    fireEvent.change(password, { target: { value: 'admin' } });
    expect(button).not.toBeDisabled();
  });

  test('Login page shows loading after submit', async () => {
    const { getByTestId, getByText } = render(
      <Login />,
    );

    const button = getByTestId('submit');
    const username = getByTestId('username');
    const password = getByTestId('password');

    fireEvent.change(username, { target: { value: 'admin' } });
    fireEvent.change(password, { target: { value: 'admin' } });
    fireEvent.click(button);
    await waitFor(() => expect(getByText('Loading...')).toBeInTheDocument());
  });

  test('Login page shows message on error', async () => {
    nock(url)
      .persist()
      .defaultReplyHeaders(defaultHeaders)
      .intercept('/config', 'GET')
      .replyWithError('Unauthorized');

    const { getByTestId, getByText } = render(
      <AuthProvider><Login /></AuthProvider>,
      { wrapper: QueryWrapper },
    );

    const button = getByTestId('submit');
    const username = getByTestId('username');
    const password = getByTestId('password');

    fireEvent.change(username, { target: { value: 'admin' } });
    fireEvent.change(password, { target: { value: 'admin' } });
    fireEvent.click(button);
    await waitFor(() => expect(getByText('Unauthorized')).toBeInTheDocument());
  });
});
