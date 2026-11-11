import { PageContext } from '../../shared/models/page-context.model';
import { SPLIT_RULE_DEFINITIONS } from './task-split-rule-definitions';

export const DOCS_TASK: PageContext = {
  pageTitle: 'Task Overview',
  topics: [
    {
      id: 'task-definition',
      title: 'Task Definition',
      content:
        'A task is a unit of workload to accomplish an indivisible scientific objective. ' +
        'If an objective is done in multiple steps, each step is mapped to a task. A task takes input and produces output. ' +
        'The goal of the task is to process the input entirely. Generally, input and output are collections of data files, ' +
        'but there are also other formats, such as a group of sequence numbers, metadata, notification, void, etc. ' +
        'Each task has a unique identifier JediTaskID in the system.',
    },
    {
      id: 'task-split-rule',
      title: 'Task Split Rule',
      content:
        'The splitRule defines how PanDA JEDI divides a task into individual jobs. ' +
        'It consists of comma-separated parameter codes and values in the format CODE=VALUE. ' +
        'These parameters control job splitting, event processing, input handling, scouting, ' +
        'resource requirements, output handling and other task execution behavior.\n\n' +
        Object.entries(SPLIT_RULE_DEFINITIONS)
          .map(([code, definition]) => `${definition.parameter} (${code})\n${definition.description}`)
          .join('\n\n'),
    },
  ],
};
