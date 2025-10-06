# Assignment 3: An AI-Augmented Concept

## Orignial Concept: NudgeEngine

**concept** NudgeEngine [User, Task]  
**purpose** creates and delivers scheduled or context-aware nudges that encourage users to start tasks  
**principle** when a user creates a task, a nudge is generate to remind the user to start the task early  

**state**
  - a set of Nudges with
    - a `user` User
    - a `task` Task
    - a `deliveryTime` Timestamp
    - a `response` (Accepted, Ignored, Snoozed, None)

**actions**
  - `generate (user: User, task: Task, deliveryTime: Timestamp): (nudge: Nudge)`
    - **requires**: task exists and belongs to user; deliveryTime has not already passed
    - **effect**: creates a new nudge 

  - `delete (user: User, nudge: Nudge): ()`
    - **requires**: nudge exists and belongs to user
    - **effect**: removes the nudge from the set of nudges

  - `system nudgeUser (): (nudge: Nudge)`
    - **requires**: deliveryTime for some Nudge is in the past 
    - **effect**: returns the nudge that needs to be sent

  - `recordResponse (nudge: Nudge): ()`
    - **effect**: records the user's response of the nudge

##  User Interaction



## Validation

In designing validators for the AINudgeEngine, we identified several plausible issues that could arise from LLM-generated nudges. First, the model might produce messages that lack actionable intent, giving general commentary rather than encouraging the user to start a task; this is mitigated by checking for the presence of action verbs or encouragement patterns, with exceptions for soft nudges when the user reports negative emotions. Second, the model could generate overly long messages that are difficult to read or lose the user's attention; a length check ensures that all nudges remain concise, with a 200-character limit. Third, the model may reference emotions incorrectly, mentioning states the user has not reported or misrepresenting their current emotional context; we enforce strict checks for negative emotions like “anxious” or “dread” to ensure they are only referenced when logged by the user.
