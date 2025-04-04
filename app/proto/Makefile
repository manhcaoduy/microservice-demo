GIT_TOP_DIR := $(shell cd .. ; pwd)
PROTOBUF_INCLUDE_DIR := ./external/protocolbuffers/protobuf/v23.4
GO_SERIVCE_PATH = ${GIT_TOP_DIR}/apps/go-grpc-service

PROTO_FOLDERS := $(shell find ${GIT_TOP_DIR}/proto -mindepth 1 -maxdepth 1 -type d \
    ! -name "external" \
    -exec basename {} \;)

go: remove-go
	for f in ${PROTO_FOLDERS}; do \
		protoc \
			--proto_path=${GIT_TOP_DIR} \
			--proto_path=${PROTOBUF_INCLUDE_DIR} \
			--go_out=${GO_SERIVCE_PATH} \
			--go_opt paths=source_relative \
            --go-grpc_out=${GO_SERIVCE_PATH}\
            --go-grpc_opt paths=source_relative \
			${GIT_TOP_DIR}/proto/$$f/*.proto; \
    	done

.PHONY: remove-go
remove-go:
	find . -name "*.pb.go" -type f -delete; \
	find . -name "proto_descriptor.pb" -type f -delete
