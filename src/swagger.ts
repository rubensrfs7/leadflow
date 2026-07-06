export const swaggerDocument = {
  "openapi": "3.0.0",
  "info": {
    "title": "Enviarleads API",
    "version": "1.0.0",
    "description": "Documentacao gerada pelo ProtoSoft para a API do servico 'enviar-leads'."
  },
  "servers": [
    {
      "url": "http://localhost:8080",
      "description": "Servidor Local"
    }
  ],
  "paths": {
    "/api/auth/register": {
      "post": {
        "tags": [
          "Autenticacao"
        ],
        "summary": "Registrar novo usuario",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/RegisterInput"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Registrado com sucesso",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "example": "Registrado com sucesso!"
                    },
                    "user": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "string"
                        },
                        "email": {
                          "type": "string"
                        },
                        "name": {
                          "type": "string"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Dados invalidos ou usuario ja existe"
          }
        }
      }
    },
    "/api/auth/login": {
      "post": {
        "tags": [
          "Autenticacao"
        ],
        "summary": "Autenticar e obter JWT token",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/LoginInput"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Login bem-sucedido",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AuthResponse"
                }
              }
            }
          },
          "401": {
            "description": "Credenciais invalidas"
          }
        }
      }
    },
    "/api/items": {
      "get": {
        "tags": [
          "Items"
        ],
        "summary": "Listar items com paginacao e busca",
        "parameters": [
          {
            "name": "page",
            "in": "query",
            "schema": {
              "type": "integer",
              "default": 1
            },
            "description": "Numero da pagina"
          },
          {
            "name": "limit",
            "in": "query",
            "schema": {
              "type": "integer",
              "default": 20
            },
            "description": "Itens por pagina"
          },
          {
            "name": "search",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Termo de busca nos campos de texto"
          },
          {
            "name": "orderBy",
            "in": "query",
            "schema": {
              "type": "string",
              "default": "created_at"
            },
            "description": "Ordenar por qual coluna"
          },
          {
            "name": "order",
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "asc",
                "desc"
              ],
              "default": "desc"
            },
            "description": "Ordem ascendente ou descendente"
          }
        ],
        "responses": {
          "200": {
            "description": "Lista retornada com sucesso",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/Items"
                      }
                    },
                    "pagination": {
                      "type": "object",
                      "properties": {
                        "page": {
                          "type": "integer"
                        },
                        "limit": {
                          "type": "integer"
                        },
                        "total": {
                          "type": "integer"
                        },
                        "totalPages": {
                          "type": "integer"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Items"
        ],
        "summary": "Criar novo registro em items",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateItemsInput"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Criado com sucesso",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Items"
                }
              }
            }
          },
          "400": {
            "description": "Dados de entrada invalidos"
          }
        }
      }
    },
    "/api/items/{id}": {
      "get": {
        "tags": [
          "Items"
        ],
        "summary": "Obter registro unico de items por id",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "ID do registro"
          }
        ],
        "responses": {
          "200": {
            "description": "Registro retornado com sucesso",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Items"
                }
              }
            }
          },
          "404": {
            "description": "Registro nao encontrado"
          }
        }
      },
      "put": {
        "tags": [
          "Items"
        ],
        "summary": "Atualizar registro de items por id",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "ID do registro"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateItemsInput"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Registro atualizado com sucesso",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Items"
                }
              }
            }
          },
          "400": {
            "description": "Dados invalidos"
          },
          "404": {
            "description": "Registro nao encontrado"
          }
        }
      },
      "delete": {
        "tags": [
          "Items"
        ],
        "summary": "Excluir registro de items por id",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "ID do registro"
          }
        ],
        "responses": {
          "200": {
            "description": "Registro excluido com sucesso",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean",
                      "example": true
                    },
                    "message": {
                      "type": "string",
                      "example": "Registro deletado com sucesso!"
                    }
                  }
                }
              }
            }
          },
          "404": {
            "description": "Registro nao encontrado"
          }
        }
      }
    },
    "/api/user": {
      "get": {
        "tags": [
          "User"
        ],
        "summary": "Listar user com paginacao e busca",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "page",
            "in": "query",
            "schema": {
              "type": "integer",
              "default": 1
            },
            "description": "Numero da pagina"
          },
          {
            "name": "limit",
            "in": "query",
            "schema": {
              "type": "integer",
              "default": 20
            },
            "description": "Itens por pagina"
          },
          {
            "name": "search",
            "in": "query",
            "schema": {
              "type": "string"
            },
            "description": "Termo de busca nos campos de texto"
          },
          {
            "name": "orderBy",
            "in": "query",
            "schema": {
              "type": "string",
              "default": "created_at"
            },
            "description": "Ordenar por qual coluna"
          },
          {
            "name": "order",
            "in": "query",
            "schema": {
              "type": "string",
              "enum": [
                "asc",
                "desc"
              ],
              "default": "desc"
            },
            "description": "Ordem ascendente ou descendente"
          }
        ],
        "responses": {
          "200": {
            "description": "Lista retornada com sucesso",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/User"
                      }
                    },
                    "pagination": {
                      "type": "object",
                      "properties": {
                        "page": {
                          "type": "integer"
                        },
                        "limit": {
                          "type": "integer"
                        },
                        "total": {
                          "type": "integer"
                        },
                        "totalPages": {
                          "type": "integer"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "401": {
            "description": "Nao autorizado"
          }
        }
      },
      "post": {
        "tags": [
          "User"
        ],
        "summary": "Criar novo registro em user",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateUserInput"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Criado com sucesso",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/User"
                }
              }
            }
          },
          "400": {
            "description": "Dados de entrada invalidos"
          },
          "401": {
            "description": "Nao autorizado"
          }
        }
      }
    },
    "/api/user/{id}": {
      "get": {
        "tags": [
          "User"
        ],
        "summary": "Obter registro unico de user por id",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "ID do registro"
          }
        ],
        "responses": {
          "200": {
            "description": "Registro retornado com sucesso",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/User"
                }
              }
            }
          },
          "401": {
            "description": "Nao autorizado"
          },
          "404": {
            "description": "Registro nao encontrado"
          }
        }
      },
      "put": {
        "tags": [
          "User"
        ],
        "summary": "Atualizar registro de user por id",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "ID do registro"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateUserInput"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Registro atualizado com sucesso",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/User"
                }
              }
            }
          },
          "400": {
            "description": "Dados invalidos"
          },
          "401": {
            "description": "Nao autorizado"
          },
          "404": {
            "description": "Registro nao encontrado"
          }
        }
      },
      "delete": {
        "tags": [
          "User"
        ],
        "summary": "Excluir registro de user por id",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "ID do registro"
          }
        ],
        "responses": {
          "200": {
            "description": "Registro excluido com sucesso",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean",
                      "example": true
                    },
                    "message": {
                      "type": "string",
                      "example": "Registro deletado com sucesso!"
                    }
                  }
                }
              }
            }
          },
          "401": {
            "description": "Nao autorizado"
          },
          "404": {
            "description": "Registro nao encontrado"
          }
        }
      }
    }
  },
  "components": {
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "Insira o token JWT retornado no login. Formato: Bearer <token>"
      }
    },
    "schemas": {
      "RegisterInput": {
        "type": "object",
        "required": [
          "email",
          "password"
        ],
        "properties": {
          "name": {
            "type": "string",
            "example": "John Doe"
          },
          "email": {
            "type": "string",
            "format": "email",
            "example": "john@example.com"
          },
          "password": {
            "type": "string",
            "format": "password",
            "example": "senha123"
          }
        }
      },
      "LoginInput": {
        "type": "object",
        "required": [
          "email",
          "password"
        ],
        "properties": {
          "email": {
            "type": "string",
            "format": "email",
            "example": "john@example.com"
          },
          "password": {
            "type": "string",
            "format": "password",
            "example": "senha123"
          }
        }
      },
      "AuthResponse": {
        "type": "object",
        "properties": {
          "token": {
            "type": "string",
            "example": "eyJhbGciOiJIUzI1NiIsIn..."
          },
          "user": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "format": "uuid"
              },
              "email": {
                "type": "string"
              },
              "name": {
                "type": "string"
              }
            }
          }
        }
      },
      "Items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer",
            "description": "Chave Primaria"
          },
          "name": {
            "type": "string"
          },
          "created_at": {
            "type": "string",
            "format": "date-time"
          },
          "updated_at": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "CreateItemsInput": {
        "type": "object",
        "required": [
          "name"
        ],
        "properties": {
          "name": {
            "type": "string"
          }
        }
      },
      "UpdateItemsInput": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          }
        }
      },
      "User": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid",
            "description": "Chave Primaria"
          },
          "name": {
            "type": "string"
          },
          "email": {
            "type": "string"
          },
          "password": {
            "type": "string"
          },
          "created_at": {
            "type": "string",
            "format": "date-time"
          },
          "updated_at": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "CreateUserInput": {
        "type": "object",
        "required": [
          "name",
          "email",
          "password"
        ],
        "properties": {
          "name": {
            "type": "string"
          },
          "email": {
            "type": "string"
          },
          "password": {
            "type": "string"
          }
        }
      },
      "UpdateUserInput": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "email": {
            "type": "string"
          },
          "password": {
            "type": "string"
          }
        }
      }
    }
  }
};
