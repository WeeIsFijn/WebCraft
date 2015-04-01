//
//  TerrainGenerator.c
//  
//
//  Created by Wouter Deferme on 01/04/15.
//
//

#include <stdio.h>

struct Vec3{
    float x
    float y
    float z
};

struct PlaneVertices{
    Vec3 topleft
    Vec3 topright
    Vec3 bottomleft
    Vec3 bottomright
};

struct PlaneVertexNormals{
    Vec3 normal
};

struct PlaneVertexIndices{
    float index[6]
};

float[] generateVertexData(int chunkSize, float seed){
    return 0.0;
}
