import React from 'react';
import { screen } from '@testing-library/react';
import { render } from './test-utils';
import { Base } from './Base';

test('renders learn react link', () => {
  render(<Base />);
  const linkElement = screen.getByText(/learn chakra/i);
  expect(linkElement).toBeInTheDocument();
});
