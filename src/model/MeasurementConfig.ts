/**
 * Configuration interface for measurement parameters
 */
export default interface MeasurementConfig {
  /**
   * Frequency of measurements in minutes
   * Must be greater than lengthOfAE
   */
  measurementFrequency: number;

  /**
   * Date and time of the first scheduled measurement
   */
  firstMeasurement: Date;

  /**
   * Flag indicating whether RGB camera should be used during measurement
   */
  rgbCamera: boolean;

  /**
   * Flag indicating whether multispectral camera should be used during measurement
   * Currently not functional (see SettingsController)
   */
  multispectralCamera: boolean;

  /**
   * Number of sensors to use for the measurement
   */
  numberOfSensors: number;

  /**
   * Length of acoustic emission measurement in minutes
   * Must be less than measurementFrequency
   */
  lengthOfAE: number;
}
