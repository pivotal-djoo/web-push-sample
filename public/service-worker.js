self.addEventListener('push', function (event) {
  if (event.data) {
    const messageText = event.data.text();
    const message = {
      title: 'Simple Title',
      body: messageText,
    };
    self.registration.showNotification('Web Push Sample', message);
  }
});
