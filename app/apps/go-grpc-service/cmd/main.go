package main

import (
	"context"
	"log"
	"net"

	pb "micro/proto/health"

	"google.golang.org/grpc"
)

type healthServer struct {
	pb.UnimplementedHealthServiceServer
}

func (s *healthServer) Check(ctx context.Context, req *pb.HealthCheckRequest) (*pb.HealthCheckResponse, error) {
	log.Println("Health check called")
	return &pb.HealthCheckResponse{
		Status: "OK",
	}, nil
}

func main() {
	lis, err := net.Listen("tcp", ":50053")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	s := grpc.NewServer()
	pb.RegisterHealthServiceServer(s, &healthServer{})

	log.Println("Health gRPC service running on :50053")
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
