// observer.js
class Subject {
  constructor() {
    this.observers = [];
  }

  // Add an observer
  subscribe(observer, event = null) {
    this.observers.push({ observer, observedEvent: event });
  }

  // Remove an observer
  unsubscribe(observer) {
    this.observers = this.observers.filter(obs => obs.observer !== observer);
  }

  // Notify observers, pii is data that contain personal information and should not be blindly sent elsewhere-
  notify(event, data, pii) {
    this.observers.forEach(async ({ observer, observedEvent }) => {
      if (!observedEvent || event === observedEvent) {
        await observer(event, data, pii);
      }
    });
  }
}


const eventSubject = new Subject();
export default eventSubject;
export { Subject, eventSubject };
