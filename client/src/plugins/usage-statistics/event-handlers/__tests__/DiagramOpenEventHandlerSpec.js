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

import DiagramOpenEventHandler from '../DiagramOpenEventHandler';

import emptyXML from './fixtures/empty.bpmn';

import emptyDMN from './fixtures/empty.dmn';

import brokenForm from './fixtures/broken-form.form';

import engineProfileXML from './fixtures/engine-profile.bpmn';

import engineProfilePlatform from './fixtures/engine-platform.form';

import engineProfileCloud from './fixtures/engine-cloud.form';

import engineProfilePlatformDMN from './fixtures/engine-platform.dmn';

import engineProfileCloudDMN from './fixtures/engine-cloud.dmn';

import processVariablesXML from './fixtures/process-variables.bpmn';

import serviceTasksXML from './fixtures/service-tasks.bpmn';

import serviceTasksWithParticipantsXML from './fixtures/service-tasks-with-participants.bpmn';

import serviceTasksWithSubprocessXML from './fixtures/service-tasks-with-subprocess.bpmn';

import subprocessEmptyXML from './fixtures/subprocess-empty.bpmn';

import subprocessesNestedXML from './fixtures/subprocess-nested.bpmn';

import subprocessesInPoolXML from './fixtures/subprocess-pool.bpmn';

import subprocessesWithContentXML from './fixtures/subprocess-content.bpmn';

import userTasksXML from './fixtures/user-tasks.bpmn';

import userTasksWithParticipantsXML from './fixtures/user-tasks-with-participants.bpmn';

import userTasksWithSubprocessXML from './fixtures/user-tasks-with-subprocess.bpmn';

import zeebeUserTasksXML from './fixtures/user-tasks.zeebe.bpmn';

import zeebeUserTasksWithSubprocessXML from './fixtures/user-tasks-with-subprocess.zeebe.bpmn';

import zeebeUserTasksWithParticipantsXML from './fixtures/user-tasks-with-participants.zeebe.bpmn';

import zeebeServiceTasksXML from './fixtures/service-tasks.zeebe.bpmn';

import zeebeServiceTasksWithSubprocessXML from './fixtures/service-tasks-with-subprocess.zeebe.bpmn';

import zeebeServiceTasksWithParticipantsXML from './fixtures/service-tasks-with-participants.zeebe.bpmn';


describe('<DiagramOpenEventHandler>', () => {

  it('should subscribe to bpmn.modeler.created', () => {

    // given
    const subscribe = sinon.spy();

    // when
    new DiagramOpenEventHandler({ subscribe });

    // then
    expect(subscribe.getCall(0).args[0]).to.eql('bpmn.modeler.created');
  });


  it('should subscribe to dmn.modeler.created', () => {

    // given
    const subscribe = sinon.spy();

    // when
    new DiagramOpenEventHandler({ subscribe });

    // then
    expect(subscribe.getCall(1).args[0]).to.eql('dmn.modeler.created');
  });


  it('should subscribe to cmmn.modeler.created', () => {

    // given
    const subscribe = sinon.spy();

    // when
    new DiagramOpenEventHandler({ subscribe });

    // then
    expect(subscribe.getCall(2).args[0]).to.eql('cmmn.modeler.created');
  });


  it('should subscribe to form.modeler.created', () => {

    // given
    const subscribe = sinon.spy();

    // when
    new DiagramOpenEventHandler({ subscribe });

    // then
    expect(subscribe.getCall(3).args[0]).to.eql('form.modeler.created');
  });


  it('should send with diagram type: bpmn', async () => {

    // given
    const subscribe = sinon.spy();

    const onSend = sinon.spy();

    const config = { get: () => null };

    const tab = createTab({
      file: {},
      type: 'bpmn'
    });

    // when
    const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

    diagramOpenEventHandler.enable();

    const bpmnCallback = subscribe.getCall(0).args[1];

    await bpmnCallback({ tab });

    // then
    expect(onSend).to.have.been.calledWith({
      event: 'diagramOpened',
      diagramType: 'bpmn',
      engineProfile: {},
      diagramMetrics: {},
      elementTemplates: [],
      elementTemplateCount: 0,
    });
  });


  it('should send with diagram type: dmn', async () => {

    // given
    const subscribe = sinon.spy();

    const onSend = sinon.spy();

    const tab = createTab({
      file: {},
      type: 'dmn'
    });

    // when
    const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe });

    diagramOpenEventHandler.enable();

    const dmnCallback = subscribe.getCall(1).args[1];

    await dmnCallback({ tab });

    // then
    expect(onSend).to.have.been.calledWith({
      event: 'diagramOpened',
      diagramType: 'dmn',
      engineProfile: {}
    });
  });


  it('should send with diagram type: cmmn', () => {

    // given
    const subscribe = sinon.spy();

    const onSend = sinon.spy();

    // when
    const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe });

    diagramOpenEventHandler.enable();

    const cmmnCallback = subscribe.getCall(2).args[1];

    cmmnCallback();

    // then
    expect(onSend).to.have.been.calledWith({
      event: 'diagramOpened',
      diagramType: 'cmmn'
    });
  });


  it('should send with diagram type: form', async () => {

    // given
    const subscribe = sinon.spy();

    const onSend = sinon.spy();

    const tab = createTab({
      file: {},
      type: 'form'
    });

    // when
    const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe });

    diagramOpenEventHandler.enable();

    const bpmnCallback = subscribe.getCall(3).args[1];

    await bpmnCallback({ tab });

    // then
    expect(onSend).to.have.been.calledWith({
      event: 'diagramOpened',
      diagramType: 'form'
    });
  });


  it('should not send with broken file contents: form', async () => {

    // given
    const subscribe = sinon.spy();

    const onSend = sinon.spy();

    const tab = createTab({
      type: 'form',
      file: {
        contents: brokenForm
      }
    });

    // when
    const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe });

    diagramOpenEventHandler.enable();

    const bpmnCallback = subscribe.getCall(3).args[1];

    await bpmnCallback({ tab });

    // then
    expect(onSend).to.not.have.been.calledWith({
      event: 'diagramOpened',
      diagramType: 'form'
    });
  });


  describe('element templates', () => {

    async function expectTemplatesSent(elementTemplates, type, expected) {

      // given
      const subscribe = sinon.spy();

      const onSend = sinon.spy();

      const configSpy = sinon.spy();

      const config = { get: (key, file) => {
        configSpy(key, file);

        return elementTemplates;
      } };

      const tab = createTab({
        file: { path: 'testPath' },
        type
      });

      // when
      const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

      diagramOpenEventHandler.enable();

      const bpmnCallback = subscribe.getCall(0).args[1];

      await bpmnCallback({ tab });

      const configArgs = configSpy.getCall(0).args;

      const sentElementTemplates = onSend.getCall(0).args[0].elementTemplates;

      // then
      expect(configArgs).to.eql([ 'bpmn.elementTemplates', { path: 'testPath' } ]);
      expect(sentElementTemplates).to.eql(expected);
    }


    it('should send element templates - platform', async () => {

      // given
      const elementTemplates = mockPlatformElementTemplates();

      const type = 'bpmn';

      const expected = [
        {
          appliesTo: [ 'bpmn:ServiceTask' ],
          properties: {
            'camunda:asyncBefore': 1,
            'camunda:class': 1,
            'camunda:inputParameter': 3,
            'camunda:outputParameter': 1
          }
        }
      ];

      // then
      await expectTemplatesSent(
        elementTemplates,
        type,
        expected
      );
    });


    it('should send element templates - cloud', async () => {

      // given
      const elementTemplates = mockCloudElementTemplates();

      const type = 'cloud-bpmn';

      const expected = [
        {
          appliesTo: [ 'bpmn:ServiceTask' ],
          properties: {
            'zeebe:input': 3,
            'zeebe:output': 1,
            'zeebe:taskDefinition:type': 1,
            'zeebe:taskHeader': 1
          }
        }
      ];

      // then
      await expectTemplatesSent(
        elementTemplates,
        type,
        expected
      );
    });


    it('should ONLY send platform element templates (mixture)', async () => {

      // given
      const elementTemplates = [
        ...mockPlatformElementTemplates(),
        ...mockCloudElementTemplates()
      ];

      const type = 'bpmn';

      const expected = [
        {
          appliesTo: [ 'bpmn:ServiceTask' ],
          properties: {
            'camunda:asyncBefore': 1,
            'camunda:class': 1,
            'camunda:inputParameter': 3,
            'camunda:outputParameter': 1
          }
        }
      ];

      // then
      await expectTemplatesSent(
        elementTemplates,
        type,
        expected
      );
    });


    it('should ONLY send cloud element templates (mixture)', async () => {

      // given
      const elementTemplates = [
        ...mockPlatformElementTemplates(),
        ...mockCloudElementTemplates()
      ];

      const type = 'cloud-bpmn';

      const expected = [
        {
          appliesTo: [ 'bpmn:ServiceTask' ],
          properties: {
            'zeebe:input': 3,
            'zeebe:output': 1,
            'zeebe:taskDefinition:type': 1,
            'zeebe:taskHeader': 1
          }
        }
      ];

      // then
      await expectTemplatesSent(
        elementTemplates,
        type,
        expected
      );
    });


    it('should resend minimal data if payload is too big', async () => {

      // given
      const subscribe = sinon.spy();

      const config = { get: () => mockPlatformElementTemplates() };

      const onSendSpy = sinon.spy();

      const onSend = (data) => new Promise((resolve, reject) => {

        onSendSpy(data);

        // http status: payload too big
        resolve({ status: 413 });
      });

      const tab = createTab({
        file: { path: 'testPath' },
        type: 'bpmn'
      });

      // when
      const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

      diagramOpenEventHandler.enable();

      const bpmnCallback = subscribe.getCall(0).args[1];

      await bpmnCallback({ tab });

      const {
        elementTemplates,
        elementTemplateCount
      } = onSendSpy.getCall(1).args[0];

      // then
      expect(elementTemplates).to.not.exist;
      expect(elementTemplateCount).to.equal(1);
    });


    it('should send icon usage', async () => {

      // given
      const elementTemplates = mockCloudElementTemplates({
        icon: {
          'contents': 'data:image/svg+xml,%3Csvg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3C/svg%3E'
        }
      });

      const type = 'cloud-bpmn';

      const expected = [
        {
          appliesTo: [ 'bpmn:ServiceTask' ],
          properties: {
            'zeebe:input': 3,
            'zeebe:output': 1,
            'zeebe:taskDefinition:type': 1,
            'zeebe:taskHeader': 1
          },
          icon: true
        }
      ];

      // then
      await expectTemplatesSent(
        elementTemplates,
        type,
        expected
      );
    });

  });


  describe('diagram metrics', () => {

    describe('process variables', () => {

      it('should send process variables', async () => {

        // given
        const subscribe = sinon.spy();

        const onSend = sinon.spy();

        const tab = createTab({
          type: 'bpmn',
          file: {
            contents: processVariablesXML
          }
        });

        const config = { get: () => null };

        // when
        const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

        diagramOpenEventHandler.enable();

        const bpmnCallback = subscribe.getCall(0).args[1];

        await bpmnCallback({ tab });

        const { diagramMetrics } = onSend.getCall(0).args[0];

        // then
        expect(diagramMetrics.processVariablesCount).to.eql(3);
      });


      it('should send empty process variables count', async () => {

        // given
        const subscribe = sinon.spy();

        const onSend = sinon.spy();

        const tab = createTab({
          type: 'bpmn',
          file: {
            contents: emptyXML
          }
        });

        const config = { get: () => null };

        // when
        const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

        diagramOpenEventHandler.enable();

        const bpmnCallback = subscribe.getCall(0).args[1];

        await bpmnCallback({ tab });

        const { diagramMetrics } = onSend.getCall(0).args[0];

        // then
        expect(diagramMetrics.processVariablesCount).to.eql(0);
      });


      it('should NOT send process variables count for dmn files', async () => {

        // given
        const subscribe = sinon.spy();

        const onSend = sinon.spy();

        const tab = createTab({
          type: 'dmn'
        });

        const config = { get: () => null };

        // when
        const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

        diagramOpenEventHandler.enable();

        const bpmnCallback = subscribe.getCall(0).args[1];

        await bpmnCallback({ tab });

        const { diagramMetrics } = onSend.getCall(0).args[0];

        // then
        expect(diagramMetrics.processVariablesCount).to.not.exist;
      });


      it('should NOT send process variables count for cloud-bpmn files', async () => {

        // given
        const subscribe = sinon.spy();

        const onSend = sinon.spy();

        const tab = createTab({
          type: 'cloud-bpmn',
          file: {
            contents: emptyXML
          }
        });

        const config = { get: () => null };

        // when
        const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

        diagramOpenEventHandler.enable();

        const bpmnCallback = subscribe.getCall(0).args[1];

        await bpmnCallback({ tab });

        const { diagramMetrics } = onSend.getCall(0).args[0];

        // then
        expect(diagramMetrics.processVariablesCount).to.not.exist;
      });

    });


    describe('user tasks', () => {

      describe('bpmn', () => {

        it('should send metrics with root level user tasks', async () => {

          // given
          const subscribe = sinon.spy();
          const onSend = sinon.spy();
          const tab = createTab({
            type: 'bpmn',
            file: {
              contents: userTasksXML
            }
          });

          const config = { get: () => null };

          // when
          const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

          diagramOpenEventHandler.enable();

          const bpmnCallback = subscribe.getCall(0).args[1];

          await bpmnCallback({ tab });

          const { diagramMetrics } = onSend.getCall(0).args[0];

          // then
          expect(diagramMetrics.tasks.userTask).to.eql({
            count: 10,
            form: {
              count: 8,
              embedded: 3,
              camundaForms: 2,
              external: 1,
              generated: 1,
              other: 1
            }
          });
        });


        it('should send metrics with user tasks in pools', async () => {

          // given
          const subscribe = sinon.spy();
          const onSend = sinon.spy();
          const tab = createTab({
            type: 'bpmn',
            file: {
              contents: userTasksWithParticipantsXML
            }
          });

          const config = { get: () => null };

          // when
          const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

          diagramOpenEventHandler.enable();

          const bpmnCallback = subscribe.getCall(0).args[1];

          await bpmnCallback({ tab });

          const { diagramMetrics } = onSend.getCall(0).args[0];

          // then
          expect(diagramMetrics.tasks.userTask).to.eql({
            count: 9,
            form: {
              count: 7,
              embedded: 3,
              camundaForms: 1,
              external: 1,
              generated: 1,
              other: 1
            }
          });
        });


        it('should send metrics with user tasks in subprocess', async () => {

          // given
          const subscribe = sinon.spy();
          const onSend = sinon.spy();
          const tab = createTab({
            type: 'bpmn',
            file: {
              contents: userTasksWithSubprocessXML
            }
          });

          const config = { get: () => null };

          // when
          const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

          diagramOpenEventHandler.enable();

          const bpmnCallback = subscribe.getCall(0).args[1];

          await bpmnCallback({ tab });

          const { diagramMetrics } = onSend.getCall(0).args[0];

          // then
          expect(diagramMetrics.tasks.userTask).to.eql({
            count: 5,
            form: {
              count: 5,
              embedded: 1,
              external: 2,
              camundaForms: 1,
              generated: 0,
              other: 1
            }
          });
        });


        it('should send empty metrics without any tasks', async () => {

          // given
          const subscribe = sinon.spy();
          const onSend = sinon.spy();
          const tab = createTab({
            type: 'bpmn',
            file: {
              contents: emptyXML
            }
          });

          const config = { get: () => null };

          // when
          const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

          diagramOpenEventHandler.enable();

          const bpmnCallback = subscribe.getCall(0).args[1];

          await bpmnCallback({ tab });

          const { diagramMetrics } = onSend.getCall(0).args[0];

          // then
          expect(diagramMetrics.tasks.userTask).to.eql({
            count: 0,
            form: {
              count: 0,
              embedded: 0,
              camundaForms: 0,
              external: 0,
              generated: 0,
              other: 0
            }
          });

        });

      });


      describe('cloud', () => {

        it('should send metrics with user tasks', async () => {

          // given
          const subscribe = sinon.spy();
          const onSend = sinon.spy();
          const tab = createTab({
            type: 'cloud-bpmn',
            file: {
              contents: zeebeUserTasksXML
            }
          });

          const config = { get: () => null };

          // when
          const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

          diagramOpenEventHandler.enable();

          const bpmnCallback = subscribe.getCall(0).args[1];

          await bpmnCallback({ tab });

          const { diagramMetrics } = onSend.getCall(0).args[0];

          // then
          expect(diagramMetrics.tasks.userTask).to.eql({
            count: 3,
            form: {
              count: 3,
              camundaForms: 3,
              other: 0
            }
          });

        });


        it('should send metrics with user tasks - sub processes', async () => {

          // given
          const subscribe = sinon.spy();
          const onSend = sinon.spy();
          const tab = createTab({
            type: 'cloud-bpmn',
            file: {
              contents: zeebeUserTasksWithSubprocessXML
            }
          });

          const config = { get: () => null };

          // when
          const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

          diagramOpenEventHandler.enable();

          const bpmnCallback = subscribe.getCall(0).args[1];

          await bpmnCallback({ tab });

          const { diagramMetrics } = onSend.getCall(0).args[0];

          // then
          expect(diagramMetrics.tasks.userTask).to.eql({
            count: 4,
            form: {
              count: 4,
              camundaForms: 4,
              other: 0
            }
          });

        });


        it('should send metrics with user tasks - participants', async () => {

          // given
          const subscribe = sinon.spy();
          const onSend = sinon.spy();
          const tab = createTab({
            type: 'cloud-bpmn',
            file: {
              contents: zeebeUserTasksWithParticipantsXML
            }
          });

          const config = { get: () => null };

          // when
          const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

          diagramOpenEventHandler.enable();

          const bpmnCallback = subscribe.getCall(0).args[1];

          await bpmnCallback({ tab });

          const { diagramMetrics } = onSend.getCall(0).args[0];

          // then
          expect(diagramMetrics.tasks.userTask).to.eql({
            count: 4,
            form: {
              count: 4,
              camundaForms: 4,
              other: 0
            }
          });

        });

      });

    });


    describe('service tasks', () => {

      describe('bpmn', () => {

        it('should send metrics with root level service tasks', async () => {

          // given
          const subscribe = sinon.spy();
          const onSend = sinon.spy();
          const tab = createTab({
            type: 'bpmn',
            file: {
              contents: serviceTasksXML
            }
          });

          const config = { get: () => null };

          // when
          const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

          diagramOpenEventHandler.enable();

          const bpmnCallback = subscribe.getCall(0).args[1];

          await bpmnCallback({ tab });

          const { diagramMetrics } = onSend.getCall(0).args[0];

          // then
          expect(diagramMetrics.tasks.serviceTask).to.eql({
            count: 11,
            implementation: {
              count: 10,
              java: 2,
              expression: 2,
              delegate: 2,
              external: 2,
              connector: 2
            }
          });
        });


        it('should send metrics with service tasks in pools', async () => {

          // given
          const subscribe = sinon.spy();
          const onSend = sinon.spy();
          const tab = createTab({
            type: 'bpmn',
            file: {
              contents: serviceTasksWithParticipantsXML
            }
          });

          const config = { get: () => null };

          // when
          const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

          diagramOpenEventHandler.enable();

          const bpmnCallback = subscribe.getCall(0).args[1];

          await bpmnCallback({ tab });

          const { diagramMetrics } = onSend.getCall(0).args[0];

          // then
          expect(diagramMetrics.tasks.serviceTask).to.eql({
            count: 9,
            implementation: {
              count: 8,
              java: 2,
              expression: 0,
              delegate: 2,
              external: 2,
              connector: 2
            }
          });
        });


        it('should send metrics with service tasks in subprocess', async () => {

          // given
          const subscribe = sinon.spy();
          const onSend = sinon.spy();
          const tab = createTab({
            type: 'bpmn',
            file: {
              contents: serviceTasksWithSubprocessXML
            }
          });

          const config = { get: () => null };

          // when
          const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

          diagramOpenEventHandler.enable();

          const bpmnCallback = subscribe.getCall(0).args[1];

          await bpmnCallback({ tab });

          const { diagramMetrics } = onSend.getCall(0).args[0];

          // then
          expect(diagramMetrics.tasks.serviceTask).to.eql({
            count: 4,
            implementation: {
              count: 3,
              java: 1,
              expression: 1,
              delegate: 0,
              external: 0,
              connector: 1
            }
          });
        });


        it('should send empty metrics without any tasks', async () => {

          // given
          const subscribe = sinon.spy();
          const onSend = sinon.spy();
          const tab = createTab({
            type: 'bpmn',
            file: {
              contents: emptyXML
            }
          });

          const config = { get: () => null };

          // when
          const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

          diagramOpenEventHandler.enable();

          const bpmnCallback = subscribe.getCall(0).args[1];

          await bpmnCallback({ tab });

          const { diagramMetrics } = onSend.getCall(0).args[0];

          // then
          expect(diagramMetrics.tasks.serviceTask).to.eql({
            count: 0,
            implementation: {
              count: 0,
              java: 0,
              expression: 0,
              delegate: 0,
              external: 0,
              connector: 0
            }
          });

        });

      });


      describe('cloud', () => {

        it('should send metrics with root level service tasks', async () => {

          // given
          const subscribe = sinon.spy();
          const onSend = sinon.spy();
          const tab = createTab({
            type: 'cloud-bpmn',
            file: {
              contents: zeebeServiceTasksXML
            }
          });

          const config = { get: () => null };

          // when
          const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

          diagramOpenEventHandler.enable();

          const bpmnCallback = subscribe.getCall(0).args[1];

          await bpmnCallback({ tab });

          const { diagramMetrics } = onSend.getCall(0).args[0];

          // then
          expect(diagramMetrics.tasks.serviceTask).to.eql({
            count: 3,
            implementation: {
              count: 2,
              external: 2
            }
          });
        });


        it('should send metrics with service tasks in pools', async () => {

          // given
          const subscribe = sinon.spy();
          const onSend = sinon.spy();
          const tab = createTab({
            type: 'cloud-bpmn',
            file: {
              contents: zeebeServiceTasksWithParticipantsXML
            }
          });

          const config = { get: () => null };

          // when
          const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

          diagramOpenEventHandler.enable();

          const bpmnCallback = subscribe.getCall(0).args[1];

          await bpmnCallback({ tab });

          const { diagramMetrics } = onSend.getCall(0).args[0];

          // then
          expect(diagramMetrics.tasks.serviceTask).to.eql({
            count: 3,
            implementation: {
              count: 2,
              external: 2
            }
          });
        });


        it('should send metrics with service tasks in subprocess', async () => {

          // given
          const subscribe = sinon.spy();
          const onSend = sinon.spy();
          const tab = createTab({
            type: 'cloud-bpmn',
            file: {
              contents: zeebeServiceTasksWithSubprocessXML
            }
          });

          const config = { get: () => null };

          // when
          const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

          diagramOpenEventHandler.enable();

          const bpmnCallback = subscribe.getCall(0).args[1];

          await bpmnCallback({ tab });

          const { diagramMetrics } = onSend.getCall(0).args[0];

          // then
          expect(diagramMetrics.tasks.serviceTask).to.eql({
            count: 3,
            implementation: {
              count: 2,
              external: 2
            }
          });
        });


        it('should send empty metrics without any tasks', async () => {

          // given
          const subscribe = sinon.spy();
          const onSend = sinon.spy();
          const tab = createTab({
            type: 'cloud-bpmn',
            file: {
              contents: emptyXML
            }
          });

          const config = { get: () => null };

          // when
          const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

          diagramOpenEventHandler.enable();

          const bpmnCallback = subscribe.getCall(0).args[1];

          await bpmnCallback({ tab });

          const { diagramMetrics } = onSend.getCall(0).args[0];

          // then
          expect(diagramMetrics.tasks.serviceTask).to.eql({
            count: 0,
            implementation: {
              count: 0,
              external: 0
            }
          });

        });

      });

    });


    describe('subprocess planes', () => {

      describe('bpmn', () => {

        it('should send metrics with subprocess plane', async () => {

          // given
          const subscribe = sinon.spy();
          const onSend = sinon.spy();
          const tab = createTab({
            type: 'bpmn',
            file: {
              contents: subprocessesWithContentXML
            }
          });

          const config = { get: () => null };

          // when
          const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

          diagramOpenEventHandler.enable();

          const bpmnCallback = subscribe.getCall(0).args[1];

          await bpmnCallback({ tab });

          const { diagramMetrics } = onSend.getCall(0).args[0];

          // then
          expect(diagramMetrics.subprocessPlanes).to.eql({
            count: 1,
            nesting: 1
          });

        });


        it('should send empty metrics with empty subprocess plane', async () => {

          // given
          const subscribe = sinon.spy();
          const onSend = sinon.spy();
          const tab = createTab({
            type: 'bpmn',
            file: {
              contents: subprocessEmptyXML
            }
          });

          const config = { get: () => null };

          // when
          const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

          diagramOpenEventHandler.enable();

          const bpmnCallback = subscribe.getCall(0).args[1];

          await bpmnCallback({ tab });

          const { diagramMetrics } = onSend.getCall(0).args[0];

          // then
          expect(diagramMetrics.subprocessPlanes).to.eql({
            count: 0,
            nesting: 0
          });

        });


        it('should send metrics with nested subprocess planes', async () => {

          // given
          const subscribe = sinon.spy();
          const onSend = sinon.spy();
          const tab = createTab({
            type: 'bpmn',
            file: {
              contents: subprocessesNestedXML
            }
          });

          const config = { get: () => null };

          // when
          const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

          diagramOpenEventHandler.enable();

          const bpmnCallback = subscribe.getCall(0).args[1];

          await bpmnCallback({ tab });

          const { diagramMetrics } = onSend.getCall(0).args[0];

          // then
          expect(diagramMetrics.subprocessPlanes).to.eql({
            count: 4,
            nesting: 3
          });

        });


        it('should send metrics with subprocess planes in pools', async () => {

          // given
          const subscribe = sinon.spy();
          const onSend = sinon.spy();
          const tab = createTab({
            type: 'bpmn',
            file: {
              contents: subprocessesInPoolXML
            }
          });

          const config = { get: () => null };

          // when
          const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

          diagramOpenEventHandler.enable();

          const bpmnCallback = subscribe.getCall(0).args[1];

          await bpmnCallback({ tab });

          const { diagramMetrics } = onSend.getCall(0).args[0];

          // then
          expect(diagramMetrics.subprocessPlanes).to.eql({
            count: 4,
            nesting: 3
          });

        });

      });


      describe('cloud-bpmn', () => {

        it('should send metrics with subprocess plane', async () => {

          // given
          const subscribe = sinon.spy();
          const onSend = sinon.spy();
          const tab = createTab({
            type: 'cloud-bpmn',
            file: {
              contents: subprocessesWithContentXML
            }
          });

          const config = { get: () => null };

          // when
          const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

          diagramOpenEventHandler.enable();

          const bpmnCallback = subscribe.getCall(0).args[1];

          await bpmnCallback({ tab });

          const { diagramMetrics } = onSend.getCall(0).args[0];

          // then
          expect(diagramMetrics.subprocessPlanes).to.eql({
            count: 1,
            nesting: 1
          });

        });


        it('should send empty metrics with empty subprocess plane', async () => {

          // given
          const subscribe = sinon.spy();
          const onSend = sinon.spy();
          const tab = createTab({
            type: 'cloud-bpmn',
            file: {
              contents: subprocessEmptyXML
            }
          });

          const config = { get: () => null };

          // when
          const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

          diagramOpenEventHandler.enable();

          const bpmnCallback = subscribe.getCall(0).args[1];

          await bpmnCallback({ tab });

          const { diagramMetrics } = onSend.getCall(0).args[0];

          // then
          expect(diagramMetrics.subprocessPlanes).to.eql({
            count: 0,
            nesting: 0
          });

        });


        it('should send metrics with nested subprocess planes', async () => {

          // given
          const subscribe = sinon.spy();
          const onSend = sinon.spy();
          const tab = createTab({
            type: 'cloud-bpmn',
            file: {
              contents: subprocessesNestedXML
            }
          });

          const config = { get: () => null };

          // when
          const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

          diagramOpenEventHandler.enable();

          const bpmnCallback = subscribe.getCall(0).args[1];

          await bpmnCallback({ tab });

          const { diagramMetrics } = onSend.getCall(0).args[0];

          // then
          expect(diagramMetrics.subprocessPlanes).to.eql({
            count: 4,
            nesting: 3
          });

        });


        it('should send metrics with subprocess planes in pools', async () => {

          // given
          const subscribe = sinon.spy();
          const onSend = sinon.spy();
          const tab = createTab({
            type: 'cloud-bpmn',
            file: {
              contents: subprocessesInPoolXML
            }
          });

          const config = { get: () => null };

          // when
          const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

          diagramOpenEventHandler.enable();

          const bpmnCallback = subscribe.getCall(0).args[1];

          await bpmnCallback({ tab });

          const { diagramMetrics } = onSend.getCall(0).args[0];

          // then
          expect(diagramMetrics.subprocessPlanes).to.eql({
            count: 4,
            nesting: 3
          });

        });

      });

    });


    it('should not send metrics for DMN', async () => {

      // given
      const subscribe = sinon.spy();
      const onSend = sinon.spy();
      const tab = createTab({
        type: 'dmn'
      });

      const config = { get: () => null };

      // when
      const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

      diagramOpenEventHandler.enable();

      const bpmnCallback = subscribe.getCall(0).args[1];

      await bpmnCallback({ tab });

      const { diagramMetrics } = onSend.getCall(0).args[0];

      // then
      expect(diagramMetrics.tasks).to.not.exist;

    });


    it('should not send metrics for forms', async () => {

      // given
      const subscribe = sinon.spy();
      const onSend = sinon.spy();
      const tab = createTab({
        type: 'form'
      });

      const config = { get: () => null };

      // when
      const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

      diagramOpenEventHandler.enable();

      const bpmnCallback = subscribe.getCall(0).args[1];

      await bpmnCallback({ tab });

      const { diagramMetrics } = onSend.getCall(0).args[0];

      // then
      expect(diagramMetrics.tasks).to.not.exist;

    });

  });


  describe('engine profile', () => {

    it('should send engine profile', async () => {

      // given
      const subscribe = sinon.spy();

      const onSend = sinon.spy();

      const tab = createTab({
        type: 'bpmn',
        file: {
          contents: engineProfileXML
        }
      });

      const config = { get: () => null };

      // when
      const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

      diagramOpenEventHandler.enable();

      const bpmnCallback = subscribe.getCall(0).args[1];

      await bpmnCallback({ tab });

      const { engineProfile } = onSend.getCall(0).args[0];

      // then
      expect(engineProfile).to.eql({
        executionPlatform: 'Camunda Platform',
        executionPlatformVersion: '7.15.0'
      });
    });


    it('should send default engine profile', async () => {

      // given
      const subscribe = sinon.spy();

      const onSend = sinon.spy();

      const tab = createTab({
        type: 'bpmn',
        file: {
          contents: emptyXML
        }
      });

      const config = { get: () => null };

      // when
      const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

      diagramOpenEventHandler.enable();

      const bpmnCallback = subscribe.getCall(0).args[1];

      await bpmnCallback({ tab });

      const { engineProfile } = onSend.getCall(0).args[0];

      // then
      expect(engineProfile).to.eql({
        executionPlatform: 'Camunda Platform'
      });
    });


    it('should send default engine profile (cloud tabs)', async () => {

      // given
      const subscribe = sinon.spy();

      const onSend = sinon.spy();

      const tab = createTab({
        type: 'cloud-bpmn',
        file: {
          contents: emptyXML
        }
      });

      const config = { get: () => null };

      // when
      const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

      diagramOpenEventHandler.enable();

      const bpmnCallback = subscribe.getCall(0).args[1];

      await bpmnCallback({ tab });

      const { engineProfile } = onSend.getCall(0).args[0];

      // then
      expect(engineProfile).to.eql({
        executionPlatform: 'Camunda Cloud'
      });
    });


    it('should send engine profile (DMN)', async () => {

      // given
      const subscribe = sinon.spy();

      const onSend = sinon.spy();

      const tab = createTab({
        type: 'dmn',
        file: {
          contents: engineProfilePlatformDMN
        }
      });

      const config = { get: () => null };

      // when
      const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

      diagramOpenEventHandler.enable();

      const dmnCallback = subscribe.getCall(1).args[1];

      await dmnCallback({ tab });

      const { engineProfile } = onSend.getCall(0).args[0];

      // then
      expect(engineProfile).to.eql({
        executionPlatform: 'Camunda Platform',
        executionPlatformVersion: '7.16.0'
      });
    });


    it('should send engine profile (Cloud DMN)', async () => {

      // given
      const subscribe = sinon.spy();

      const onSend = sinon.spy();

      const tab = createTab({
        type: 'dmn',
        file: {
          contents: engineProfileCloudDMN
        }
      });

      const config = { get: () => null };

      // when
      const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

      diagramOpenEventHandler.enable();

      const dmnCallback = subscribe.getCall(1).args[1];

      await dmnCallback({ tab });

      const { engineProfile } = onSend.getCall(0).args[0];

      // then
      expect(engineProfile).to.eql({
        executionPlatform: 'Camunda Cloud',
        executionPlatformVersion: '8.0.0'
      });
    });


    it('should send default engine profile', async () => {

      // given
      const subscribe = sinon.spy();

      const onSend = sinon.spy();

      const tab = createTab({
        type: 'dmn',
        file: {
          contents: emptyDMN
        }
      });

      const config = { get: () => null };

      // when
      const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

      diagramOpenEventHandler.enable();

      const dmnCallback = subscribe.getCall(1).args[1];

      await dmnCallback({ tab });

      const { engineProfile } = onSend.getCall(0).args[0];

      // then
      expect(engineProfile).to.eql({
        executionPlatform: 'Camunda Platform'
      });
    });


    it('should send default engine profile (cloud DMN)', async () => {

      // given
      const subscribe = sinon.spy();

      const onSend = sinon.spy();

      const tab = createTab({
        type: 'cloud-dmn',
        file: {
          contents: emptyDMN
        }
      });

      const config = { get: () => null };

      // when
      const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

      diagramOpenEventHandler.enable();

      const dmnCallback = subscribe.getCall(1).args[1];

      await dmnCallback({ tab });

      const { engineProfile } = onSend.getCall(0).args[0];

      // then
      expect(engineProfile).to.eql({
        executionPlatform: 'Camunda Cloud'
      });
    });


    it('should send Platform engine profile (forms)', async () => {

      // given
      const subscribe = sinon.spy();

      const onSend = sinon.spy();

      const tab = createTab({
        type: 'form',
        file: {
          contents: engineProfilePlatform
        }
      });

      const config = { get: () => null };

      // when
      const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

      diagramOpenEventHandler.enable();

      const bpmnCallback = subscribe.getCall(3).args[1];

      await bpmnCallback({ tab });

      const { engineProfile } = onSend.getCall(0).args[0];

      // then
      expect(engineProfile).to.eql({
        executionPlatform: 'Camunda Platform',
        executionPlatformVersion: '7.15'
      });
    });

    it('should send Cloud engine profile (forms)', async () => {

      // given
      const subscribe = sinon.spy();

      const onSend = sinon.spy();

      const tab = createTab({
        type: 'form',
        file: {
          contents: engineProfileCloud
        }
      });

      const config = { get: () => null };

      // when
      const diagramOpenEventHandler = new DiagramOpenEventHandler({ onSend, subscribe, config });

      diagramOpenEventHandler.enable();

      const bpmnCallback = subscribe.getCall(3).args[1];

      await bpmnCallback({ tab });

      const { engineProfile } = onSend.getCall(0).args[0];

      // then
      expect(engineProfile).to.eql({
        executionPlatform: 'Camunda Cloud',
        executionPlatformVersion: '1.1'
      });
    });

  });

});


// helpers //////

function mockPlatformElementTemplates() {
  return [
    {
      appliesTo: [ 'bpmn:ServiceTask' ],
      properties: [
        { binding: { name: 'camunda:class', type: 'property' } },
        { binding: { name: 'sender', type: 'camunda:inputParameter' } },
        { binding: { name: 'receivers', type: 'camunda:inputParameter' } },
        { binding: { name: 'messageBody', type: 'camunda:inputParameter' } },
        { binding: { type: 'camunda:outputParameter' } },
        { binding: { name: 'camunda:asyncBefore', type: 'property' } }
      ]
    }
  ];
}

function mockCloudElementTemplates(overrides = {}) {
  return [
    {
      $schema: 'https://example.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json',
      appliesTo: [ 'bpmn:ServiceTask' ],
      properties: [
        { binding: { type: 'zeebe:taskDefinition:type' } },
        { binding: { name: 'sender', type: 'zeebe:input' } },
        { binding: { name: 'receivers', type: 'zeebe:input' } },
        { binding: { name: 'messageBody', type: 'zeebe:input' } },
        { binding: { source: 'result', type: 'zeebe:output' } },
        { binding: { key: 'header', type: 'zeebe:taskHeader' } }
      ],
      ...overrides
    }
  ];
}

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
