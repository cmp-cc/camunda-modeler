/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

/* global sinon */

import MixpanelHandler from '../../MixpanelHandler';
import TabEventHandler from '../TabEventHandler';

import emptyXML from './fixtures/empty.bpmn';

import emptyDMN from './fixtures/empty.dmn';

import emptyForm from './fixtures/empty.form';

import engineProfileXML from './fixtures/engine-profile.bpmn';

import engineProfileCloudXML from './fixtures/engine-cloud.bpmn';

import engineProfilePlatform from './fixtures/engine-platform.form';

import engineProfileCloud from './fixtures/engine-cloud.form';

import engineProfilePlatformDMN from './fixtures/engine-platform.dmn';

import engineProfileCloudDMN from './fixtures/engine-cloud.dmn';


describe('<TabEventHandler>', () => {

  let subscribe, track;

  beforeEach(() => {

    subscribe = sinon.spy();

    track = sinon.spy();

    new TabEventHandler({
      track,
      subscribe
    });

    MixpanelHandler.getInstance().enable('token', 'id', 'stage');
  });


  describe('should subscribe', () => {
    it('should subscribe to bpmn.modeler.created', () => {

      // then
      expect(subscribe.getCall(0).args[0]).to.eql('bpmn.modeler.created');
    });


    it('should subscribe to dmn.modeler.created', () => {

      // then
      expect(subscribe.getCall(1).args[0]).to.eql('dmn.modeler.created');
    });


    it('should subscribe to form.modeler.created', () => {

      // then
      expect(subscribe.getCall(2).args[0]).to.eql('form.modeler.created');
    });


    it('should subscribe to tab.closed', () => {

      // then
      expect(subscribe.getCall(3).args[0]).to.eql('tab.closed');
    });
  });


  describe('should send with diagram type', () => {

    describe('open', () => {

      it('bpmn', async () => {

        // given
        const tab = createTab({
          file: {},
          type: 'bpmn'
        });

        // when
        const bpmnCallback = subscribe.getCall(0).args[1];

        await bpmnCallback({
          tab
        });

        // then
        expect(track).to.have.been.calledWith('diagram:opened', {
          diagramType: 'bpmn'
        });
      });


      it('dmn', async () => {

        // given
        const tab = createTab({
          file: {},
          type: 'dmn'
        });

        // when
        const dmnCallback = subscribe.getCall(1).args[1];

        await dmnCallback({
          tab
        });

        // then
        expect(track).to.have.been.calledWith('diagram:opened', {
          diagramType: 'dmn'
        });
      });


      it('form', async () => {

        // given
        const tab = createTab({
          file: {},
          type: 'form'
        });

        // when
        const formCallback = subscribe.getCall(2).args[1];

        await formCallback({
          tab
        });

        // then
        expect(track).to.have.been.calledWith('diagram:opened', {
          diagramType: 'form'
        });
      });

    });


    it('closed', async () => {

      // given
      const tab = createTab({
        file: {},
        type: 'bpmn'
      });

      // when
      const bpmnCallback = subscribe.getCall(3).args[1];

      await bpmnCallback({
        tab
      });

      // then
      expect(track).to.have.been.calledWith('diagram:closed', {
        diagramType: 'bpmn'
      });
    });

  });


  describe('should send engine profile', () => {

    describe('open', () => {

      describe('set engine profile', () => {

        it('bpmn', async () => {

          // given
          const tab = createTab({
            type: 'bpmn',
            file: {
              contents: engineProfileXML
            }
          });

          // when
          const bpmnCallback = subscribe.getCall(0).args[1];

          await bpmnCallback({ tab });

          const { executionPlatform, executionPlatformVersion } = track.getCall(0).args[1];

          // then
          expect(executionPlatform).to.eql('Camunda Platform');
          expect(executionPlatformVersion).to.eql('7.15.0');
        });


        it('cloud bpmn', async () => {

          // given
          const tab = createTab({
            type: 'cloud-bpmn',
            file: {
              contents: engineProfileCloudXML
            }
          });

          // when
          const bpmnCallback = subscribe.getCall(0).args[1];

          await bpmnCallback({ tab });

          const { executionPlatform, executionPlatformVersion } = track.getCall(0).args[1];

          // then
          expect(executionPlatform).to.eql('Camunda Cloud');
          expect(executionPlatformVersion).to.eql('1.1');
        });


        it('dmn', async () => {

          // given
          const tab = createTab({
            type: 'dmn',
            file: {
              contents: engineProfilePlatformDMN
            }
          });

          // when
          const dmnCallback = subscribe.getCall(1).args[1];

          await dmnCallback({ tab });

          const { executionPlatform, executionPlatformVersion } = track.getCall(0).args[1];

          // then
          expect(executionPlatform).to.eql('Camunda Platform');
          expect(executionPlatformVersion).to.eql('7.16.0');
        });


        it('cloud dmn', async () => {

          // given
          const tab = createTab({
            type: 'dmn',
            file: {
              contents: engineProfileCloudDMN
            }
          });

          // when
          const dmnCallback = subscribe.getCall(1).args[1];

          await dmnCallback({ tab });

          const { executionPlatform, executionPlatformVersion } = track.getCall(0).args[1];

          // then
          expect(executionPlatform).to.eql('Camunda Cloud');
          expect(executionPlatformVersion).to.eql('8.0.0');
        });


        it('form', async () => {

          // given
          const tab = createTab({
            type: 'form',
            file: {
              contents: engineProfilePlatform
            }
          });

          // when
          const bpmnCallback = subscribe.getCall(2).args[1];

          await bpmnCallback({ tab });

          const { executionPlatform, executionPlatformVersion } = track.getCall(0).args[1];

          // then
          expect(executionPlatform).to.eql('Camunda Platform');
          expect(executionPlatformVersion).to.eql('7.15');
        });


        it('cloud form ', async () => {

          // given
          const tab = createTab({
            type: 'form',
            file: {
              contents: engineProfileCloud
            }
          });

          // when
          const bpmnCallback = subscribe.getCall(2).args[1];

          await bpmnCallback({ tab });

          const { executionPlatform, executionPlatformVersion } = track.getCall(0).args[1];

          // then
          expect(executionPlatform).to.eql('Camunda Cloud');
          expect(executionPlatformVersion).to.eql('1.1');
        });

      });


      describe('default engine profile', () => {

        it('bpmn', async () => {

          // given
          const tab = createTab({
            type: 'bpmn',
            file: {
              contents: emptyXML
            }
          });

          // when
          const bpmnCallback = subscribe.getCall(0).args[1];

          await bpmnCallback({ tab });

          const { executionPlatform } = track.getCall(0).args[1];

          // then
          expect(executionPlatform).to.eql('Camunda Platform');
        });


        it('dmn', async () => {

          // given
          const tab = createTab({
            type: 'dmn',
            file: {
              contents: emptyDMN
            }
          });

          // when
          const dmnCallback = subscribe.getCall(1).args[1];

          await dmnCallback({ tab });

          const { executionPlatform } = track.getCall(0).args[1];

          // then
          expect(executionPlatform).to.eql('Camunda Platform');
        });


        it('form', async () => {

          // given
          const tab = createTab({
            type: 'form',
            file: {
              contents: emptyForm
            }
          });

          // when
          const bpmnCallback = subscribe.getCall(2).args[1];

          await bpmnCallback({ tab });

          const { executionPlatform } = track.getCall(0).args[1];

          // then
          expect(executionPlatform).to.eql('Camunda Platform');
        });

      });


      describe('close', () => {

        it('bpmn', async () => {

          // given
          const tab = createTab({
            type: 'bpmn',
            file: {
              contents: engineProfileXML
            }
          });

          // when
          const bpmnCallback = subscribe.getCall(3).args[1];

          await bpmnCallback({ tab });

          const { executionPlatform, executionPlatformVersion } = track.getCall(0).args[1];

          // then
          expect(executionPlatform).to.eql('Camunda Platform');
          expect(executionPlatformVersion).to.eql('7.15.0');

        });


        it('dmn', async () => {

          // given
          const tab = createTab({
            type: 'dmn',
            file: {
              contents: engineProfilePlatformDMN
            }
          });

          // when
          const bpmnCallback = subscribe.getCall(3).args[1];

          await bpmnCallback({ tab });

          const { executionPlatform, executionPlatformVersion } = track.getCall(0).args[1];

          // then
          expect(executionPlatform).to.eql('Camunda Platform');
          expect(executionPlatformVersion).to.eql('7.16.0');

        });


        it('form', async () => {

          // given
          const tab = createTab({
            type: 'form',
            file: {
              contents: engineProfilePlatform
            }
          });

          // when
          const bpmnCallback = subscribe.getCall(3).args[1];

          await bpmnCallback({ tab });

          const { executionPlatform, executionPlatformVersion } = track.getCall(0).args[1];

          // then
          expect(executionPlatform).to.eql('Camunda Platform');
          expect(executionPlatformVersion).to.eql('7.15');

        });

      });

    });

  });
});



// helpers //////

function createTab(overrides = {}) {
  return {
    id: 42,
    name: 'foo.bar',
    type: 'bar',
    title: 'foo',
    file: {
      name: 'foo.bar',
      contents: '',
      path: null
    },
    ...overrides
  };
}