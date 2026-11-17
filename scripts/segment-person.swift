// Writes a soft person mask (grayscale PNG, same size as the input) using macOS Vision.
// Usage: swift segment-person.swift <input.jpg> <mask.png>
import AppKit
import CoreImage
import Vision

let args = CommandLine.arguments
let input = URL(fileURLWithPath: args[1]), output = URL(fileURLWithPath: args[2])
guard let image = CIImage(contentsOf: input, options: [.applyOrientationProperty: true]) else { fatalError("cannot read input") }
let request = VNGeneratePersonSegmentationRequest()
request.qualityLevel = .accurate
request.outputPixelFormat = kCVPixelFormatType_OneComponent8
try VNImageRequestHandler(ciImage: image).perform([request])
guard let buffer = request.results?.first?.pixelBuffer else { fatalError("no mask") }
var mask = CIImage(cvPixelBuffer: buffer)
mask = mask.transformed(by: CGAffineTransform(scaleX: image.extent.width / mask.extent.width, y: image.extent.height / mask.extent.height))
let ctx = CIContext()
guard let cg = ctx.createCGImage(mask, from: image.extent) else { fatalError("render failed") }
let rep = NSBitmapImageRep(cgImage: cg)
try rep.representation(using: .png, properties: [:])!.write(to: output)
print("mask", cg.width, cg.height)
