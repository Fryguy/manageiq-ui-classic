import React from 'react';
import { act } from 'react-dom/test-utils';
import fetchMock from 'fetch-mock';
import WorkersForm from '../../components/workers-form/workers-form';

import '../helpers/miqSparkle';
import '../helpers/addFlash';
import '../helpers/sprintf';
import MiqFormRenderer from '../../forms/data-driven-form';
import { mount } from '../helpers/mountForm';

describe('Workers form', () => {
  let initialProps;
  let settingsData;
  let expectedValues;
  let baseUrl;
  let submitSpyMiqSparkleOn;
  let submitSpyMiqSparkleOff;
  let spyAddFlash;

  beforeEach(() => {
    initialProps = {
      server: {
        id: 1,
        name: 'Server 1',
      },
      product: 'ManageIQ',
      zone: 'Default zone',
    };

    settingsData = {
      workers: {
        ems_metrics_collector_worker: {
          count: 8,
          memory_threshold: 419430400,
        },
        ems_metrics_processor_worker: {
          count: 2,
          memory_threshold: 629145600,
        },
        ems_refresh_worker: {
          memory_threshold: 2147483648,
        },
        event_catcher: {
          memory_threshold: '2.gigabytes',
        },
        generic_worker: {
          count: 2,
          memory_threshold: 524288000
        },
        priority_worker: {
          count: 2,
          memory_threshold: 419430400,
        },
        queue_worker_base: {
          memory_threshold: '500.megabytes',
        },
        remote_console_worker: {
          memory_threshold: '1.gigabytes',
        },
        reporting_worker: {
          count: 2,
          memory_threshold: 524288000
        },
        smart_proxy_worker: {
          count: 2,
          memory_threshold: 576716800,
        },
        ui_worker: {
          count: 1,
          memory_threshold: '1.gigabytes',
        },
        web_service_worker: {
          connection_pool_size: 8,
          memory_threshold: 1073741824,
        },
        worker_base: {
          count: 1,
          memory_threshold: '400.megabytes',
        },
      },
    };

    expectedValues = {
      'ems_metrics_collector_worker.count': 8,
      'ems_metrics_collector_worker.memory_threshold': 419430400,
      'ems_metrics_processor_worker.count': 2,
      'ems_metrics_processor_worker.memory_threshold': 629145600,
      'ems_refresh_worker.memory_threshold': 2147483648,
      'event_catcher.memory_threshold': 2147483648,
      'generic_worker.count': 2,
      'generic_worker.memory_threshold': 524288000,
      'priority_worker.count': 2,
      'priority_worker.memory_threshold': 419430400,
      'remote_console_worker.count': 1,
      'reporting_worker.count': 2,
      'reporting_worker.memory_threshold': 524288000,
      'smart_proxy_worker.count': 2,
      'smart_proxy_worker.memory_threshold': 576716800,
      'ui_worker.count': 1,
      'web_service_worker.count': 1,
      'web_service_worker.memory_threshold': 1073741824,
    };

    baseUrl = `/api/servers/${initialProps.server.id}/settings`;

    submitSpyMiqSparkleOn = jest.spyOn(window, 'miqSparkleOn');
    submitSpyMiqSparkleOff = jest.spyOn(window, 'miqSparkleOff');
    spyAddFlash = jest.spyOn(window, 'add_flash');
  });

  afterEach(() => {
    fetchMock.restore();

    submitSpyMiqSparkleOn.mockRestore();
    submitSpyMiqSparkleOff.mockRestore();
    spyAddFlash.mockRestore();
  });

  it('should render correctly', async(done) => {
    fetchMock
      .getOnce(baseUrl, settingsData);

    let wrapper;
    await act(async() => {
      wrapper = mount(<WorkersForm {...initialProps} />);
    });

    wrapper.update();
    expect(wrapper.find(MiqFormRenderer)).toHaveLength(1);
    done();
  });

  it('should render error when loading is broken', (done) => {
    fetchMock
      .getOnce(baseUrl, 500);

    const wrapper = mount(<WorkersForm {...initialProps} />);

    setImmediate(() => {
      wrapper.update();
      expect(wrapper.find(MiqFormRenderer)).toHaveLength(0);
      expect(spyAddFlash).toHaveBeenCalledWith('Could not fetch the data', 'error');
      done();
    });
  });

  it('should request data after mount and set to state', async(done) => {
    fetchMock
      .getOnce(baseUrl, settingsData);

    let wrapper;
    await act(async() => {
      wrapper = mount(<WorkersForm {...initialProps} />);
    });

    wrapper.update();
    expect(submitSpyMiqSparkleOn).toHaveBeenCalled();
    expect(submitSpyMiqSparkleOff).toHaveBeenCalled();
    expect(fetchMock.called(baseUrl)).toBe(true);
    expect(fetchMock.calls()).toHaveLength(1);

    Object.keys(expectedValues).forEach((key) => {
      expect(wrapper.find(`input[name="${key}"]`).props().value).toEqual(expectedValues[key]);
    });

    done();
  });

  it('should send data in the patch format, show message and set initialValues', async(done) => {
    fetchMock
      .getOnce(baseUrl, settingsData);
    fetchMock
      .patchOnce(baseUrl, settingsData);

    let wrapper;
    await act(async() => {
      wrapper = mount(<WorkersForm {...initialProps} />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(1);

    await act(async() => {
      wrapper.find('Select[name="smart_proxy_worker.count"]').at(1).prop('onChange')(1);
    });

    wrapper.update();

    await act(async() => {
      wrapper.find('form').simulate('submit');
    });
    expect(fetchMock.calls()).toHaveLength(2);
    expect(fetchMock.lastCall()[1].body).toEqual(JSON.stringify({
      workers: {
        smart_proxy_worker: {
          count: 1,
        },
      },
    }));

    expect(wrapper.find('input[name="smart_proxy_worker.count"]').props().value).toEqual(1);

    expect(submitSpyMiqSparkleOn).toHaveBeenCalledTimes(2);
    expect(submitSpyMiqSparkleOff).toHaveBeenCalledTimes(2);
    expect(spyAddFlash).toHaveBeenCalledWith(`Configuration settings saved for ${initialProps.product} Server "${initialProps.server.name} [${initialProps.server.id}]" in Zone "${initialProps.zone}"`, 'success');
    done();
  });
});
