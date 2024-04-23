export default interface MeasurementConfig {
    measurementFrequency: number;
    firstMeasurement: Date;
    rgbCamera: boolean;
    multispectralCamera: boolean;
    numberOfSensors: number;
    lengthOfAE: number;
}