# Thresholds

Values `between 0 and 1` are interpreted as percentage of the image size.

Values `greater or equal to 1` are interpreted as absolute pixel count.

## Which mode to choose

Fixed values (starting from `1`) are great if you want to

### Example:

Based on an image with a size of `1,280` x `800` pixels we have a total amount of `1,024,000` pixels.

Here are a few threshold values and their corresponding pixel percentages and amounts:

| Threshold Value<br />(config) | Percentage<br />(logs) | Actual Pixels<br />(logs) |
| ----------------------------- | ---------------------- | ------------------------- |
| 1                             | N/A                    | 1 px                      |
| 20                            | N/A                    | 20 px                     |
| 300                           | N/A                    | 300 px                    |
| 0.0005                        | 0.05%                  | 512 px                    |
| 0.005                         | 0.5%                   | 5,120 px                  |
| 0.05                          | 5%                     | 51,200 px                 |
| 0.5                           | 50%                    | 512,000 px                |
