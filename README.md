# Project : restaurant-reviews-stage-3
## By  Fouad Asharf

## Table of contents
- [Description](#description)
- [Project Folder Structure](#project-folder-structure)
- [Required Libraries and Dependencies](#required-libraries-and-dependencies)
- [How to Run Project](#how-to-run-project)
- [Copyright and license](#copyright-and-license)

## Description
took the connected application built in [Stage One](https://github.com/fouad3/restaurant-reviews-stage-1) and [Stage Two](https://github.com/fouad3/restaurant-reviews-stage-2) and added additional functionality. added a form to allow users to create their own reviews. If the app is offline, the form will defer updating to the remote database until a connection is established. Finally, i worked to optimize the site to meet even stricter performance benchmarks than the previous stages, and test again using [Lighthouse](https://developers.google.com/web/tools/lighthouse), this project is a part of the Udacity's [Mobile Web Specialist
Nanodegree](https://www.udacity.com/course/mobile-web-specialist-nanodegree--nd024).


## Project Folder Structure
    .
    ├── dist                    # distribution files for production
    ├── app                     # client-side files 
    ├── server                  # server-side files 
    └── README.md


## Required Libraries and Dependencies
  * [Node.js](https://nodejs.org/en/)
  * [Gulp.js](https://github.com/gulpjs/gulp/blob/master/docs/getting-started/1-quick-start.md)

## How to Run Project

1. clone or download this repository.

2. run the development local API server by using the following commands:
      1. Navigate to the server folder:
          ```
          cd restaurant-reviews-stage-3/server
          ```
      2. Install server dependancies:
          ```
          npm i
          ```
      3. Install Sails.js globally:
          ```
          npm i sails -g
          ```
      4. Start the server:
          ```
          node server
          ```
      
3. run the app by using the following commands:
      1. Navigate to the project folder:
          ```
          cd restaurant-reviews-stage-3
          ```
      2. Install app dependancies:
          ```
          npm i
          ```
      3. Start the app:
          ```
          gulp
          ```
      
 4. prepare the app for production by using the following commands:
 .
      1. Navigate to the project folder:
          ```
          cd restaurant-reviews-stage-3
          ```
      2. Start the production process:
          ```
          gulp build
          ```


## Attribution
* [Map Box API](https://www.mapbox.com/install/)
* [leafletjs](https://leafletjs.com/)
* [WICG/focus-visible](https://github.com/WICG/focus-visible)
* [Server-Side Code Owners](https://github.com/udacity/mws-restaurant-stage-3/blob/master/CODEOWNERS)

## Copyright and License
- supplied without rights information contributed by [Udacity](http://www.udacity.com).
