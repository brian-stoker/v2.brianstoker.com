import '@testing-library/jest-dom';
import React from 'react';
import TeamStatistics from './TeamStatistics';

describe('TeamStatistics component', () => {
  let component;

  beforeEach(() => {
    component = render(<TeamStatistics />);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders without crashing', () => {
    expect(component).toBeTruthy();
  });

  describe('Conditional rendering', () => {
    it('renders team statistics for each item in data', () => {
      const { getAllByRole } = render(<TeamStatistics />);
      expect(getAllByRole('listitem')).toHaveLength(data.length);
    });

    it('does not render empty items in data', () => {
      const dataWithEmptyItem = [
        { number: '2011', metadata: 'The starting year' },
        { number: '', metadata: '' },
        { number: '3+', metadata: 'Countries represented' },
      ];
      const { getAllByRole } = render(<TeamStatistics />);
      expect(getAllByRole('listitem')).toHaveLength(dataWithEmptyItem.filter(item => item.number).length);
    });
  });

  describe('Props', () => {
    it('accepts data prop', () => {
      const dataProp = [
        { number: '2011', metadata: 'The starting year' },
        { number: '100%', metadata: 'Remote global team' },
        { number: '3+', metadata: 'Countries represented' },
      ];
      render(<TeamStatistics data={dataProp} />);
    });

    it('throws an error if data prop is missing', () => {
      expect(() => render(<TeamStatistics />)).toThrowError(
        'data prop is required'
      );
    });

    it('accepts theme prop', () => {
      const theme = { applyDarkStyles: jest.fn() };
      render(<TeamStatistics theme={theme} />);
    });
  });

  describe('User interactions', () => {
    let componentWithData;

    beforeEach(() => {
      componentWithData = render(
        <TeamStatistics data={[{ number: '2011', metadata: 'The starting year' }]}>
          {/* Some content */}
        </TeamStatistics>
      );
    });

    it('renders the correct item on click', () => {
      const itemElement = componentWithData.getByRole('listitem').at(0);
      const itemText = itemElement.textContent;
      const itemClickHandlerMock = jest.fn();
      itemElement.click(itemClickHandlerMock);
      expect(itemClickHandlerMock).toHaveBeenCalledTimes(1);
      expect(itemClickHandlerMock).toHaveBeenCalledWith({
        data: [
          { number: '2011', metadata: 'The starting year' },
        ],
      });
    });

    it('renders the correct team statistics on input change', () => {
      const itemElement = componentWithData.getByRole('listitem').at(0);
      const itemMetadataInput = itemElement.querySelector('input');
      const itemMetadataValue = 'New metadata value';
      itemMetadataInput.value = itemMetadataValue;
      itemMetadataInput.dispatchEvent(new Event('change'));
      expect(itemElement).toHaveTextContent(
        `${'2011'}.${itemMetadataValue}`
      );
    });
  });

  it('renders snapshot', () => {
    const { asFragment } = render(<TeamStatistics data={data} />);
    expect(asFragment()).toMatchSnapshot();
  });
});