# Deep Learning Performance on GPUs

> Source: https://docs.nvidia.com/deeplearning/performance/index.html#performance-background

GPUs accelerate computing by performing independent calculations in parallel. Since deep learning operations involve many such operations, they can leverage GPUs very well. 

It is useful to understand how deep learning operations are utilizing the GPU. For example, operations that are not matrix multiplies, such as activation functions and batch-normalization, often are *memory-bound*. In these cases, tweaking parameters to more efficiently use the GPU can be ineffective. In these cases, the data movement between the host and the device can limit the performance. By understanding such intricacies, we can design better code to leverage GPUs to the fullest.

> We shall discuss the concepts in context of NVIDIA GPUs because of the existing monopoly.

## Architecture Fundamentals

The core paradigm of GPU is parallel compute. It has processing elements and a memory hierarchy. At a high level, GPUs consist of Streaming Multiprocessors (SMs), on-chip L2 cache, and high-bandwidth RAM. 

Each SM has its own instruction scheduler and execution pipelines. In a neural network, *multiply-add* is the most frequent operation. A typical spec sheet shows FLOPS rate of GPU operations - #SMs*SM clock rate\*#FLOPs. 

## Execution Model

GPUs execute functions in a 2-level hierarchy of threads - a given function's threads are grouped into equally-sized *thread blocks*, and a set of thread blocks are launched to execute the function. The latency caused by dependent instructions is hidden by switching to the execution of other threads. As a result, the number of threads needed to effectively use a GPU is much higher than the number of cores or instruction pipelines. 

At runtime, each thread block is placed on an SM for execution. All the threads in the block communicate via a shared memory in the blocks and synchronize efficiently. To use the GPU to the maximum, we need to execute many SMs (since each threadblock only activates one SM). Furthermore, each SM can execute multiple threadblocks simultaneously. Therefore, we need to launch many threadblocks, a number several times higher than the number of SMs. 

These thread blocks running concurrently are termed as a *wave*. In effect, we need to launch functions that execute several waves of thread blocks to minimize the *tail effect* (towards the end of a function, only a few active thread blocks remain).

## Understanding performance

There are three factors determining performance - **memory bandwidth, math bandwidth and latency**. To analyze these better, let $$T_{mem}$$ be the time spent in accessing memory and $$T_{math}$$ is the time spent performing math operations. 



$$
\begin{align*}
T_{mem} &= \text{\# bytes accessed}/ \text{memory bandwidth} \\
T_{math} &= \#\text{ math ops}/\text{math bandwidth}
\end{align*}
$$



If these functions can be overlapped, then the total time is approximately $$\max(T_{mem}, T_{math})$$. And based on the dominance, we categorize the functions as *math-limited* and *memory-limited*. So if a function is math-limited, we have



$$
\#\text{ops}/\#\text{bytes} > BW_{math}/BW_{mem}
$$



The left-hand side of this inequality is known as **arithmetic intensity**, and the right-hand side is called as *ops:byte* ratio. Based on this description, we have the following data for NVIDIA V100 GPU  for FP16 data -


| Operation | Arithmetic Intensity | Usually limited by... |
| --- | --- | --- |
| Linear layer (4096 outputs, 1024 inputs, batch size 512) | 315 FLOPS/B | arithmetic |
| Linear layer (4096 outputs, 1024 inputs, batch size 1) | 1 FLOPS/B | memory |
| Max pooling with 3x3 window and unit stride | 2.25 FLOPS/B | memory |
| ReLU activation | 0.25 FLOPS/B | memory |
| Layer normalization | < 10 FLOPS/B | memory |



Many common operations have low arithmetic intensities (memory-limited). *Note.* This analysis assumes that the workload is large enough to saturate the device and not be limited by latency. 



## Operation Categories

There are three main types of operations in a neural network

1. Element-wise operations - Unary/binary operations such as ReLU and element-wise addition. These layers tend to be memory-limited as they perform few operations per byte accessed. 

2. Reduction operations - Operations that produce values over a range of input tensor values, such as pooling, softmax and normalization layers. These layers usually have low arithmetic intensity (memory limited).

3. Dot-product operations - Operations can be expressed as dot-product of two tensors, such as attention and fully-connected layers. These operations tend to be math-limited if the matrices are large. For smaller operations, these are memory limited. 



## Summary

The number of SMs in the GPU determines the ops:bytes ratio. To maximize the performance, ensure sufficient parallelism by oversubscribing the SMs. The most likely performance limiter is

- Latency if there is not sufficient parallelism
- Math if there is sufficient parallelism and algorithm arithmetic intensity is higher than the GPU ops:byte ratio
- Memory if there is sufficient parallelism and algorithm arithmetic intensity is lower than the GPU ops:byte ratio

# Matrix Multiplication

As we've observed previously, General Matrix Multiplications (GEMMs) is the most frequent operation in neural network layers. For the sake of the discussion, based on the conventions, let $$A \in \mathbb R^{m \times k}, B \in \mathbb R^{k \times n}$$ and $$ C = A \times  \in \mathbb R^{m \times n}$$. $$C$$ would require a total of $$M*N*K$$ fused multiply-adds (FMAs) (twice for the FLOPs). In general, for smaller multiplications, the operation is memory limited, and otherwise it is math-limited. As a consequence, vector products $$M = 1$$ or $$N = 1$$ are always memory limited and their arithmetic intensity is less than 1. 

## Implementation

Most of the GPUs implement matrix multiplication as a tiling operation - each thread block computes its output tile by stepping through the $$K$$ dimension in tiles. 

The latest NVIDIA GPUs have Tensor Cores to maximize multiplications in tensors. The performance is better when $$M, n< k$$ are aligned to multiples of 16 bytes. 

To aid with the code design, NVIDIA has provided the cuBLAS library that contains its optimized GEMM implementations. The tradeoff arises between parallelism and memory reuse - Larger tiles have fewer memory I/O but reduced parallelism. This is, in particular, a concern for smaller matrices. The library contains a variety of tiling to techniques to best utilize the GPU.

## Dimension Quantization effects

A GPU function is executed by launching a number of thread blocks, each with the same number of threads. This introduces two potential effects on execution efficiency - tile and wave quantization.

- **Tile Quantization** - Tile quantization occurs when matrix dimensions are not divisible by the thread block tile size.

![](/assets/img/Machine Learning Systems/2025-01-25-23-37-44-image.png)

- **Wave quantization** - The total number of tiles is quantized to the number of multiprocessors on the GPU.

# MI300X vs H100 vs H200

> Source: [MI300X vs H100 vs H200 Benchmark Part 1: Training; CUDA Moat Still Alive; SemiAnalysis](https://semianalysis.com/2024/12/22/mi300x-vs-h100-vs-h200-benchmark-part-1-training/)

A case-study to examine why numbers on paper do not translate to real-life performance. 

![](https://i0.wp.com/semianalysis.com/wp-content/uploads/2024/12/10-H100-vs-H200-vs-MI300X-Basic-Specs-initial-1.jpg?resize=2184%2C1088&ssl=1)

Comparing numbers on sheets is similar to comparing the megapixel count of cameras - the software is very important. NVIDIAs real world performance is also quite low compared to the papers. The analysis boils down to this - The potential on paper of AMD's MI300X is not realized due to lack of AMDs software stack and testing. The gap between AMDs and NVIDIAs software is large - AMD is still catching up while NVIDIA is racing ahead.  AMDs PyTorch is unfortunately broken. 

## Matrix Multiplication

OpenAI provides a `do_bench` function to benchmark matrix multiplications - it provides cache clearing between runs, ways to warmup and execute the benchmark multiple times and takes the median result. The results are as follows - 

![](https://i0.wp.com/semianalysis.com/wp-content/uploads/2024/12/71-bf16-gemm-perf-for-real-world-shapes-w-amd-images.png?resize=1489%2C1084&ssl=1)

Notice how the marketed value is much higher than the real-world performance! The main finding from this study is that AMDs software stack is riddled with bugs that lowered its performance quite a lot. 

It is also important to ensure that the underlying benchmark has no issues. For example, a popular benchmark for GEMM showed comparable performance for AMD and NVIDIA. However, on closer look, it had issues - it did not clear out L2 Cache and displayed the max performance rather than mean/median. 

## HBM Memory Bandwidth Performance

Higher HBM bandwidth leads to better inference performance. It is also helpful during training, specially with higher batch sizes. 

![](https://i0.wp.com/semianalysis.com/wp-content/uploads/2024/12/115-HBM-Copy-Bandwidth-Chart.png?resize=1485%2C1047&ssl=1)

## Training Large Language Models

MLPerf GPT3 175B training is a good metric to measure the time it takes to train a model. However, this benchmark turned out to be very difficult for the AMD GPUs. Instead, the authors designed a benchmark better representing a user workload. They noted that many AI practitioners do not use Megatron, NeMo and 3D parallelism (advances in modern networks architectures for faster inference) due to their rigidity and complexity. 

Overall for this test, on a single node, the authors obtained the following results - 

![](https://i0.wp.com/semianalysis.com/wp-content/uploads/2024/12/121-bf16-single-node-8gpu-training-perf-with-new-AMD-images.png?resize=1491%2C1180&ssl=1)

The public releases of NVIDIA perform much higher than AMDs bugs-resolved builds. Apart from these single node builds, these providers also have a server cluster availability. NVIDIAs GPUs are merged with the NVLink fabric whereas AMD has xGMI. They connect up to 8GPUs with up to 450GB/s of bandwidth per GPU. This network of GPUs synchronize via the map-reduce command, and NVIDIAs topology performs better than that of AMDs. 

Ironically, AMDs RCCI team has only 32 GPUs to experiment with the algorithms. Looking at this dismal conditions, TensorWave and SemiAnalysis sponsored some clusters to the team to aid the team in fixing their software.

## Conclusion

Due to poor internal testing and a lack of good testing suite internally at AMD, MI300 is not usable out of the box. There have been advanced in attention mechanisms such as the **FlexAttention** that can improve the speed of window attention by 10-20x. However, due to the lacking nature of AMDs software, they are 6 months behind NVIDIA which is a long time in the rapid AI age. 

In fact, many of AMDs libraries are forked off NVIDIA's open-source libraries! The authors suggest AMD should hire more software talent to reduce the gap and reshape their user interface. 


