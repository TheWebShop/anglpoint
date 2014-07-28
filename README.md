anglPoint
========

anglPoint is an Angular application that interfaces with SharePoint's (currently tested with 2010) Client Object Model and REST api to deliver data from lists/libraries.

The application uses a model description to determine what lists/libraries (support for multiple simultaneously) to pull. Caching of individual list/library data is also supported.

The following steps describe how to use the application:

1.) Copy angular.js (or minified version), app.js, controllers.js, services.js, and models.js into your script working directory.

2.) Open up models.js and edit the information to reflect the lists/libraries you wish to use.

3.) On a SharePoint page, insert references to all of the above files (Note: This application will only work on a SharePoint page, that is, an aspx page that is running SharePoint's controls. Caching for the application requires the use of SP.js.)

4.) Set up your view as a typical Angular application. Once you have laid out the controller, the data is available to you from the scope variable 'dataSet'.

5.) The data is now yours to command!
