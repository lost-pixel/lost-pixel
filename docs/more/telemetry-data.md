# Telemetry data

### **Overview**

The term **telemetry** refers to the collection of certain usage data to help _improve the quality of a piece of software_. Lost Pixel uses telemetry in one and single scenario:

* collecting usage data of the action

This page describes the overall telemetry approach for Lost Pixel, what kind of data is collected and how to opt-out of data collection.

### **Why does Lost Pixel collect metrics?**

Telemetry helps us better understand _how many users_ are using our product, _how often_ they are using our product and which mode is the most popular among usages. Our telemetry implementation is intentionally limited in scope:

* We use telemetry to answer one question: how many monthly active developers are using **`lost-pixel`**

### **When is data collected?**

Data is collected whenever Lost Pixel engine is ran.

#### **Usage data**

Invocations of the `**lost-pixel**` action results in data being sent to our event collection tool. Note that:

* The data does **NOT** include your images, repository name, organisation or anything that identifies you

Here is an overview of the data that's being submitted:



| Name         | Example   | Description                                                 |
| ------------ | --------- | ----------------------------------------------------------- |
| mode         | storybook | The mode in which lost pixel is running, could be multiple. |
| version      | 2.15.0    | Current version of lost-pixel                               |
| run-duraiton | 9.3       | The time it took to run the action                          |
| shots-number | 24        | The number of screenshots that we made during the .process  |

### Opt out

\
You can opt-out of this behavior by setting the `**LOST_PIXEL_DISABLE_TELEMETRY**` environment variable to **`1`**, e.g.:

```
LOST_PIXEL_DISABLE_TELEMETRY=1
```
