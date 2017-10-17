import expect from 'expect';
import * as actions from './networking';
import cst from '../constants/networking';

describe('[Action] Networking', () => {
  it('networking should create NETWORKING_START action', () => {
    expect(actions.start()).toEqual({
      type: cst.START,
    });
  });

  it('networking should create NETWORKING_STOP action', () => {
    expect(actions.stop()).toEqual({
      type: cst.STOP,
    });
  });
});
