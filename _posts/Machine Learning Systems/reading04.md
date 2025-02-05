# [TVM: End-to-end compiler for Deep Learning](https://arxiv.org/pdf/1802.04799)

Current ML frameworks require significant manual effort to deploy on different hardware. TVM exposes the graph-level and operator-level optimizations to provide performance portability. In the current frameworks, techniques such as computational graph  representations, auto-differentiation and dynamic memory management have been well established. Optimizing these structures on different hardware is however often infeasible, and developers have resorted to highly engineered and vendor-specific operator libraries. These libraries require significant amount of manual tuning and cannot be ported across devices. 

How does the hardware matter? The input to hardware instructions are multi-dimensional, with fixed or variable lengths; they dictate different data layout and they have special requirements for memory hierarchy. These different constraints (memory access, threading pattern, hardware primitives - loop tiles and ordering, caching, unrolling) form a large search space that needs to be optimized to get efficient implementation. 

TVM, an end-to-end ML compiler, has been designed to take a high-level specification of a deep-learning program from existing frameworks and generate a low-level optimized code for a diverse set of hardware backends. To do so, they made the following contributions

- A *tensor expression language* to build operators and provide program transformation primitives to generate equivalent programs

- An *automated program optimization framework* to find optimized tensor operators based on an ML cost model that adapts and improves based on the data received from the hardware backend. 

- A *graph-rewriter* compiler together the high-level and operator-level optimizations.

![](/assets/img/Machine Learning Systems/2025-02-04-17-41-07-image.png)

## Graph Optimization

As mentioned previously, DL frameworks represent the data flow with graphs. This is different from the low-level compiler intermediate representation due to the presence of large, multi-dimensional tensors. Similar to compiler graph optimization, TVM also performs similar optimizations on this graph -

1. **Operator Fusion** - Fuse multiple small operations together, reducing the activation energy for executing each operator. The commonly used operators can be classified as injective (one-to-one, e.g., add), reduction (many-to-one, e.g., sum), complex-out-fusable (element-wise map based output, e.g., convolution), and opaque (cannot be fused, e.g., sort).
   
   These classifications help us identify operators that can be combined. For example, in general
   
   - Multiple injective operators can be fused into one another
   
   - A reduction operator can be fused with the input injective operators
   
   - Complex-out-fusable operators can fuse element-wise operators to its output
   
   These fusions generate **up to 1.2x to 2x speedup**!

2. **Constant folding** - Pre-compute graph parts that can be determined statically, saving execution costs

3. **Static memory planning pass** - Pre-allocate memory to hold each intermediate tensor

4. **Data Layout transformations** - Transform internal data layouts into back-end friendly forms. For example, a DL accelerator might exploit $$4\times4$$ matrix operations, requiring data to be tiled into $$4\times4$$ chunks. The memory hierarchy constraints are also taken into consideration.

These optimizations is where the search-space complexity arises. With more operators being introduced on a regular basis, the number of possible fuses can grow significantly considering the increasing number of various hardware back-ends as well. Doing these optimizations manually is infeasible and we need to automate the process. 

## Tensor Operations

TVM produces efficient code for each operator by generating many valid implementations for each hardware back-end and choosing an optimized implementation. This process is built on Halide's idea of decoupling descriptions from computation rules and extends it to support new optimizations (nested parallelism, tensorization and latency hiding).

### Tensor Expression and Schedule Space

Unlike high-level computation graph representations, where the implementation of tensor operations is opaque, each operation is described in an index formula expression language. For example, matrix multiplication is written as

```python
m, n, h = t.var('m'), t.var('n'), t.var('h')
A = t.placeholder((m, h), name='A')
B = t.placeholder((n, h), name='B')
k = t.reduce_axis((0, h), name='k')
C = t.compute((m, n), lambda y, x: 
                t.sum(A[k, y] * B[k, x], axis=k))
```

Each compute operation specifies both shape and expression for output. Since the language does not specify the loop structure and other execution details, it provides the flexibility for adding hardware-aware optimizations. *Schedules* are built incrementally with basic transformations to preserve the program's logical equivalence. To achieve high performance on many back-ends, the schedule primitives must be diverse enough to cover various hardware backends. 

### Nested Parallelism

A common paradigm based on fork-join concept, nested parallelism is present in many existing solutions. Based on memory hierarchies, solutions also consider *shared memory spaces* and *fetching data cooperatively*. TVM builds on this idea with the concept of **memory scopes** to the schedule space so that a compute stage can be marked as shared. These shared tasks have *memory synchronization barriers* to ensure proper read/writes.

### Tensorization

To ensure high arithmetic intensity, hardware developers have started implementing *tensor compute primitives* that consider the common operations and design specific hardware for their execution. They can improve the performance (similar to vectorization for SIMD architectures), but with more and more accelerators with their own variants of tensor instructions, there is a need for an extensible solution that can seamlessly integrate with all these.

To do so, TVM extends the tensor expression language to include hardware intrinsics. Doing so decouples the schedule from specific hardware primitives. The generated schedules are broken into a sequence of micro-kernel calls which can also use the *tensorize* primitive to make use of accelerators. 

### Explicit Memory Latency Hiding

Latency hiding refers to the process of overlapping memory operations with computation to maximize utilization of memory and compute resources. These strategies depend on the underlying hardware -

- On CPUs, memory latency hiding is achieved implicitly with simultaneous multithreading or hardware prefetching.

- GPUs rely on rapid context switching of many warps of threads

- Specialized DL accelerators such as the TPU usually favor leaner control with a decoupled access-execute (DAE) architecture and offload the problem of fine-grained synchronization to software. This is difficult to program because it requires explicit low-level synchronization. To solve this, TVM introduces a virtual threading scheduling primitive that lets programmers specify a high-level data parallel program. TVM automatically lowers the program to a single instruction stream with low-level explicit synchronization. 

Empirically, they observed that peak utilization increased by 25% for ResNet with latency hiding.

## Automating Optimization

Now that we have a set of schedule primitives, TVM needs to find the optimal operator implementations for each layer of the DL model. An *automated schedule optimizer* automates optimizing the hardware parameters through a high-dimensional search space. It consists of

1. A schedule explorer that proposes new configurations. A *schedule template specification* API is used to let a developer define the changeable parameters in a code for a given hardware. TVM also has a *generic master template* to automatically extract possible knobs based on the tensor expression language. More the number of configurations, better optimization is possible.

2. A machine learning cost model that predicts the performance of a given configuration. Defining a perfect cost model is difficult - we need to consider memory access patterns, data reuse, pipeline dependencies, threading patterns, etc for every hardware. So, TVM uses a statistical approach by training an ML model that keeps getting better with newer data. The model has been chosen for *quality* and *speed*. The model uses a rank objective to predict the relative order of runtime costs. The model itself is a *gradient tree boosting model* (based on XGBoost) that makes predictions based on features extracted from the loop program. 

The explorer starts with random configurations, and, at each step, randomly walks to a nearby configuration. This exploration method is more efficient than random exploration. 

A *distributed device pool* scales up the running of on-hardware trials and enables fine-grained resource sharing among multiple optimization jobs. 

## Summary

The core of TVM is implemented in C++ with approximately 50k lines of code. It achieves significantly higher performance as compared to earlier works. However, even with this extensive approach, the models can be designed carefully to achieve much better performance. For example, as seen in Flash Attention, the optimization is a result of human intellectual effort rather than a manual exploration of a partially defined search space by an automated compiler. 

# [Triton: An intermediate language and compiler for Neural Network computations](https://www.eecs.harvard.edu/~htk/publication/2019-mapl-tillet-kung-cox.pdf)

As with the previous motivation, Triton was developed to provide a way for users to test new models efficiently without needing to manually optimize it for the hardware. Triton is a language and a compiler centered around the concept of *tile*, statically shaped multi-dimensional sub-arrays. It is a C-based language for expressing tensor programs in terms of operations on parametric tile variables and provides novel tile-level optimization passes for compiling programs into efficient GPU code. 

Previous approaches to tackle the wide-variety of deep-learning models include **Domain-Specific Languages (DSLs)** based on polyhedral machinery (tenor comprehensions) and/or loop synthesis techniques (Halide, TVM, PlaidML, etc). These systems perform well for models such as depthwise-separable convolutions, but they are much slower than vendor-based libraries like cuBLAS and cuDNN. The problem with vendor based libraries is that they support only a restricted set of tensor operations. 

These issues have been addressed by the use of micro-kernels - hand-written tile-level intrinsics, but it requires significant manual labour and cannot be generalized. Compilers do not support these tile-level operators and optimizations.  The prior approaches can be summarized as

1. Tensor level IRs - XLA, Flow to transform tensor programs into predefined LLVM-IR and CUDA-C operation templates (e.g., tensor contractions, element-wise operations, etc) using pattern matching. Triton provides more flexibility. 

2. The polyhedral model - Tensor Comprehensions (TC), Diesel to parameterize and automate the compilation of one of many DNN layers into LLVM-IR and CUDA-C programs. Triton supports non-affine tensor indices. 

3. Loop synthesizers - Halide, TVM to transform tensor computations into loop nests that can be manually optimized using user-defined schedules.  Automatic inference of possible execution schedule in Triton. 

## Triton-C

A C-like language for expressing tensor programs in terms of parametric tile variables. It provides a stable interface for existing DNN trans-compilers and programmers familiar with CUDA. Here is an example of matrix multiplication

```c
// Tile shapes are parametric and can be optimized
// by compilation backends
const tunable int TM = {16, 32, 64, 128};
const tunable int TN = {16, 32, 64, 128};
const tunable int TK = {8, 16};

// C = A * B.T
kernel void matmul_nt(float* a, float* b, float* c, int M, int N, int K) {
    // 1D tile of indices
    int rm[TM] = get_global_range(0);
    int rn[TN] = get_global_range(1);
    int rk[TK] = 0...TK;
    
    // 2D tile of accumulators
    float C[TM, TN] = {0};

    // 2D tile of pointers
    float* pa[TM, TK] = a + rm[:, newaxis] + rk * M;
    float* pb[TN, TK] = b + rn[:, newaxis] + rk * K;
    
    for (int k = K; k >= 0; k -= TK) {
        bool check_k[TK] = rk < k;
        bool check_a[TM, TK] = (rm < M)[:, newaxis] && check_k;
        bool check_b[TN, TK] = (rn < N)[:, newaxis] && check_k;
        
        // Load tile operands
        float A[TM, TK] = check_a ? *pa : 0;
        float B[TN, TK] = check_b ? *pb : 0;
        
        // Accumulate
        C += dot(A, trans(B));
        
        // Update pointers
        pa = pa + TK * M;
        pb = pb + TK * N;
    }
    
    // Write-back accumulators
    float* pc[TM, TN] = c + rm[:, newaxis] + rn * M;
    bool check_c[TM, TN] = (rm < M)[:, newaxis] && (rn < N);
    @check_c * pc = C;
}
```

It is a front-end to describe CUDA like syntax with Numpy like semantics. The syntax is based on ANSI C, and has the following changes

- Tile declarations: Syntax for multi-dimensional arrays that can be made parametric with `tunable` keyword. Ranges with ellipses.

- Broadcasting using `newaxis` keyword

- Predicated statements in tiles with `@`

A tile is an abstraction to hide details involving intra-tile memory coalescing, cache management and specialized hardware utilization.

The triton programming model is similar to that of CUDA - each kernel corresponds to a single thread execution. 

## Triton-IR

An LLVM-based Intermediate Representation (IR) that provides an environment suitable for tile-level program analysis, transformation and optimization. Triton-IR programs are constructed directly from Triton-C during parsing, but automatic generation from embedded DSLs is unimplemented. Here is an example for the `max` operation

```C
define kernel void @relu ( float * %A , i32 %M , i32 % N ) {
prologue :
% rm = call i32 <8 > get_global_range (0) ;
% rn = call i32 <8 > get_global_range (1) ;
; broadcast shapes
%1 = reshape i32 <8 , 8 > % M;
% M0 = broadcast i32 <8 , 8 > %1;
%2 = reshape i32 <8 , 8 > % N;
% N0 = broadcast i32 <8 , 8 > %2;
; broadcast global ranges
%3 = reshape i32 <8 , 1 > % rm;
% rm_bc = broadcast i32 <8 , 8 > %3;
%4 = reshape i32 <1 , 8 > % rn;
% rn_bc = broadcast i32 <8 , 8 > %4;
; compute mask
% pm = icmp slt % rm_bc , % M0;
% pn = icmp slt % rn_bc , % N0;
% msk = and % pm , % pn;
; compute pointer
% A0 = splat float * <8 , 8 > % A;
%5 = getelementptr % A0 , % rm_bc ;
%6 = mul % rn_bc , % M0;
% pa = getelementptr %5 , %6;
; compute result
% a = load % pa;
% _0 = splat float <8 , 8 > 0;
% result = max % float %a , % _0;
; write back
store fp32 <8 , 8 > % pa , % result
}
```

It is similar to LLVM-IR, but it includes the necessary extensions for tile-level data-flow and control-flow.

It constructs a data-flow graph including nodes for multi-dimensional tiles and instructions made from basic blocks of code. The control-flow is handled with the use of *Predicated SSA* and $$\psi$$*-functions* (compare and merge). 

## Triton-JIT compiler

A Just-In-Time (JIT) compiler and code generation backend for compiling Triton-IR programs into efficient LLVM bitcode. It includes 

- A set of tile-level, machine-independent passes aimed at simplifying input compute kernels independently of any compilation target. It involves operations such as pre-fetching to reduce cache misses and tile-level peephole optimization that implement algebraic tricks with tensors.

- A set of tile-level, machine dependent passes for generating efficient GPU-ready LLVM-IR. It involves 
  
  - Hierarchical Tiling - The tiles defined by the user are further broken down to the machine's constraints. 
  
  - Memory coalescing - Making sure that adjacent threads simultaneously access nearby memory locations. 
  
  - Shared memory allocation - To improve memory reuse.
  
  - Shared memory synchronization - Barriers to preserve program correctness in parallel execution.

- An auto-tuner that optimizes any meta-parameters associated with the above passes. Traditional auto-tuners rely on hand-written templates. In contrast, Triton-JIT extracts optimization spaces from Triton-IR (hierarchical tiling parameters only - up to 3 per dimension per tile) and optimizes using an exhaustive search. **This needs to be improved in the future**

## Summary

Triton defeats the other prior solutions achieving performance close to DSLs. However, the authors have highlighted many areas where this framework can be improved in the future - support for tensor cores (the ones TVM talked about), implementation of quantized kernels and integration into higher-level DSLs.


