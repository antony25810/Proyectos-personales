import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login screen on initial route', () => {
  render(<App />);
  const loginTitle = screen.getByRole('heading', {
    name: /iniciar sesi[o\u00f3]n/i,
    level: 2,
  });
  expect(loginTitle).toBeInTheDocument();
});
