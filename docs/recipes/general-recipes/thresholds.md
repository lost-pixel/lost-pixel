# Thresholds

Values `between 0 and 1` are interpreted as percentage of the image size.

Values `greater or equal to 1` are interpreted as absolute pixel count.

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

## Which mode to choose

Fixed values (starting from `1`) are great if you want to limit the pixel amount to a certain value. This is useful for situations where e.g. rounded corners are causing unwanted regressions. Usually, it makes sense to stay in the range of 1 to 100 pixels.

Percentage values (lower than `1`) are great for situations where you want to cover regression more from a statistical point of view. Percentage values scale perfectly with the image sizes.
But there also lies the danger. If the image size is bigger, even a small percentage would turn into a big number. (e.g. 1% of an image of 1280 x 5000 px in size would create a threshold of 640 px)
That would render such regression tests ineffective.

The best practice is to start with zero tolerance (`0`).
When the first flaky regressions show up, try to find an absolute value of pixels that would cover a good threshold.
Sometimes, there's no value in testing flaky areas of the page. It could make sense to [mask](/user-docs/api-reference/mask) such areas.
Setting percentage values will make sense for stories or pages where content is being added over time.

Finding the right balance for the threshold setting will depend on your strategy on visual regression testing. You can go with a rather strict approach or choose to adopt a more flexible process.
