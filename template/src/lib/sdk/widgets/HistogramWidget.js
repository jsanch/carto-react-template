import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectSourceById, addFilter, removeFilter } from 'config/cartoSlice';
import { WrapperWidgetUI, HistogramWidgetUI } from 'lib/ui';
import { getHistogram, FilterTypes } from 'lib/sdk';
import { getApplicableFilters } from '../models/FilterQueryBuilder';

function getSelectBars(column, filters) {
  return filters && filters[column] && filters[column][FilterTypes.BETWEEN]
    ? filters[column][FilterTypes.BETWEEN].values
    : [];
}

export default function HistogramWidget(props) {
  const { column } = props;
  const [histogramData, setHistogramData] = useState([]);
  const dispatch = useDispatch();
  const viewport = useSelector(
    (state) => props['viewport-filter'] && state.carto.viewport
  );
  const source = useSelector(
    (state) => selectSourceById(state, props['data-source']) || {}
  );
  const { title, formatter, dataAxis, ticks } = props;
  const { data, credentials } = source;
  const selectedBars = getSelectBars(column, source.filters);

  useEffect(() => {
    if (
      data &&
      credentials &&
      (!props['viewport-filter'] || (props['viewport-filter'] && viewport))
    ) {
      const filters = getApplicableFilters(source.filters, props.id);
      getHistogram({ ...props, data, filters, credentials, viewport }).then(
        (data) => data && setHistogramData(data)
      );
    } else {
      setHistogramData([]);
    }
  }, [credentials, data, source.filters, viewport, props]);

  const handleSelectedBarsChange = ({ bars }) => {
    if (bars && bars.length) {
      const thresholds = bars.map((i) => {
        return [ticks[i - 1], ticks.length !== i + 1 ? ticks[i] : undefined];
      });
      dispatch(
        addFilter({
          id: props['data-source'],
          column,
          type: FilterTypes.BETWEEN,
          values: thresholds,
          owner: props.id,
        })
      );
    } else {
      dispatch(
        removeFilter({
          id: props['data-source'],
          column,
        })
      );
    }
  };

  return (
    <WrapperWidgetUI title={title} expandable={true}>
      <HistogramWidgetUI
        data={histogramData}
        dataAxis={dataAxis || ticks}
        selectedBars={selectedBars}
        onSelectedBarsChange={handleSelectedBarsChange}
        tooltipFormatter={formatter}
      />
    </WrapperWidgetUI>
  );
}