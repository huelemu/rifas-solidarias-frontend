# test_rifas_endpoints.ps1
# Script de Testing para Endpoints de Rifas - PowerShell Version
# ==========================================

# Configuración
#$API_URL = "https://apirifas.huelemu.com.ar"
$API_URL = "http://localhost:3100"  # Descomenta para testing local

Write-Host "🚀 TESTING MÓDULO RIFAS - ENDPOINTS BACKEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "API URL: $API_URL" -ForegroundColor Yellow
Write-Host ""

# Función para hacer requests HTTP
function Invoke-ApiRequest {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-RestMethod @params
        return @{
            Success = $true
            Data = $response
            StatusCode = 200
        }
    }
    catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            StatusCode = $_.Exception.Response.StatusCode.value__
        }
    }
}

# ==========================================
# PASO 1: VERIFICAR SERVIDOR
# ==========================================

Write-Host "📡 PASO 1: Verificando servidor..." -ForegroundColor Blue

# Test básico de conexión
Write-Host "🔍 Test de conexión básica:"
$connectionTest = Invoke-ApiRequest -Url "$API_URL/"
if ($connectionTest.Success) {
    Write-Host "✅ Servidor responde correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error de conexión: $($connectionTest.Error)" -ForegroundColor Red
}

# Test de base de datos
Write-Host "🔍 Test de base de datos:"
$dbTest = Invoke-ApiRequest -Url "$API_URL/test-db"
if ($dbTest.Success) {
    Write-Host "✅ Base de datos: $($dbTest.Data.status)" -ForegroundColor Green
    Write-Host "   - Total usuarios: $($dbTest.Data.total_usuarios)" -ForegroundColor Gray
    Write-Host "   - Total instituciones: $($dbTest.Data.total_instituciones)" -ForegroundColor Gray
} else {
    Write-Host "❌ Error en base de datos: $($dbTest.Error)" -ForegroundColor Red
}

# Test específico de rifas
Write-Host "🔍 Test específico de rifas:"
$rifasTest = Invoke-ApiRequest -Url "$API_URL/test-rifas"
if ($rifasTest.Success) {
    Write-Host "✅ Módulo rifas: $($rifasTest.Data.status)" -ForegroundColor Green
    Write-Host "   - Total rifas: $($rifasTest.Data.total_rifas)" -ForegroundColor Gray
    Write-Host "   - Total números: $($rifasTest.Data.total_numeros)" -ForegroundColor Gray
} else {
    Write-Host "❌ Error en módulo rifas: $($rifasTest.Error)" -ForegroundColor Red
}

Write-Host ""

# ==========================================
# PASO 2: LOGIN PARA OBTENER TOKEN
# ==========================================

Write-Host "🔐 PASO 2: Obteniendo token de autenticación..." -ForegroundColor Blue

# Intentar login con usuario de prueba
$loginBody = @{
    email = "juan.lacy@gmail.com"
    password = "F1delius!!"
} | ConvertTo-Json

$loginResponse = Invoke-ApiRequest -Url "$API_URL/auth/login" -Method "POST" -Body $loginBody

$token = $null
if ($loginResponse.Success -and $loginResponse.Data.data.accessToken) {
    $token = $loginResponse.Data.data.accessToken
    Write-Host "✅ Token obtenido exitosamente" -ForegroundColor Green
    Write-Host "🔑 Token: $($token.Substring(0, [Math]::Min(50, $token.Length)))..." -ForegroundColor Gray
} else {
    Write-Host "⚠️ No se pudo obtener token. Intentando crear usuario de prueba..." -ForegroundColor Yellow
    
    # Intentar registrar usuario de prueba
    $registerBody = @{
        nombre = "Admin"
        apellido = "Test"
        email = "admin@test.com"
        password = "test123"
        rol = "admin_institucion"
        institucion_id = 1
    } | ConvertTo-Json
    
    $registerResponse = Invoke-ApiRequest -Url "$API_URL/auth/register" -Method "POST" -Body $registerBody
    
    if ($registerResponse.Success) {
        Write-Host "📝 Usuario registrado exitosamente" -ForegroundColor Green
        
        # Intentar login nuevamente
        $loginResponse = Invoke-ApiRequest -Url "$API_URL/auth/login" -Method "POST" -Body $loginBody
        if ($loginResponse.Success -and $loginResponse.Data.data.accessToken) {
            $token = $loginResponse.Data.data.accessToken
            Write-Host "✅ Token obtenido después del registro" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ Error al registrar usuario: $($registerResponse.Error)" -ForegroundColor Red
    }
}

if (-not $token) {
    Write-Host "❌ No se pudo obtener token. Continuando sin autenticación..." -ForegroundColor Red
}

Write-Host ""

# ==========================================
# PASO 3: TESTING ENDPOINTS PÚBLICOS
# ==========================================

Write-Host "🌐 PASO 3: Testing endpoints públicos..." -ForegroundColor Blue

# GET /rifas - Listar todas las rifas
Write-Host "🔍 GET /rifas (Listar rifas):"
$rifasResponse = Invoke-ApiRequest -Url "$API_URL/rifas"

if ($rifasResponse.Success) {
    $rifasCount = 0
    if ($rifasResponse.Data.data) {
        $rifasCount = $rifasResponse.Data.data.Count
    }
    Write-Host "📊 Rifas encontradas: $rifasCount" -ForegroundColor Green
    
    if ($rifasCount -gt 0) {
        $primeraRifa = $rifasResponse.Data.data[0]
        $primeraRifaId = $primeraRifa.id
        Write-Host "🎲 Primera rifa ID: $primeraRifaId" -ForegroundColor Gray
        
        # GET /rifas/:id - Obtener rifa específica
        Write-Host "🔍 GET /rifas/$primeraRifaId (Detalle de rifa):"
        $rifaDetailResponse = Invoke-ApiRequest -Url "$API_URL/rifas/$primeraRifaId"
        
        if ($rifaDetailResponse.Success) {
            $rifaNombre = $rifaDetailResponse.Data.data.titulo -or $rifaDetailResponse.Data.data.nombre -or "Sin nombre"
            Write-Host "📝 Nombre: $rifaNombre" -ForegroundColor Gray
            
            # GET /rifas/:id/numeros - Obtener números de la rifa
            Write-Host "🔍 GET /rifas/$primeraRifaId/numeros (Números):"
            $numerosResponse = Invoke-ApiRequest -Url "$API_URL/rifas/$primeraRifaId/numeros"
            
            if ($numerosResponse.Success) {
                $numerosCount = 0
                if ($numerosResponse.Data.data) {
                    $numerosCount = $numerosResponse.Data.data.Count
                }
                Write-Host "🎯 Números encontrados: $numerosCount" -ForegroundColor Gray
            } else {
                Write-Host "❌ Error al obtener números: $($numerosResponse.Error)" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Error al obtener detalle: $($rifaDetailResponse.Error)" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️ No se encontraron rifas. El sistema necesita datos de prueba." -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Error al obtener rifas: $($rifasResponse.Error)" -ForegroundColor Red
}

Write-Host ""

# ==========================================
# PASO 4: TESTING ENDPOINTS PROTEGIDOS
# ==========================================

if ($token) {
    Write-Host "🔒 PASO 4: Testing endpoints protegidos..." -ForegroundColor Blue
    
    $authHeaders = @{
        "Authorization" = "Bearer $token"
    }
    
    # POST /rifas - Crear nueva rifa
    Write-Host "🔍 POST /rifas (Crear rifa):"
    
    $fechaInicio = (Get-Date).ToString("yyyy-MM-dd")
    $fechaFin = (Get-Date).AddDays(30).ToString("yyyy-MM-dd")
    
    $newRifaBody = @{
        titulo = "Rifa Test PowerShell"
        descripcion = "Rifa creada desde el test de PowerShell"
        precio_numero = 25.00
        total_numeros = 50
        fecha_inicio = $fechaInicio
        fecha_fin = $fechaFin
        institucion_id = 1
    } | ConvertTo-Json
    
    $createRifaResponse = Invoke-ApiRequest -Url "$API_URL/rifas" -Method "POST" -Headers $authHeaders -Body $newRifaBody
    
    if ($createRifaResponse.Success -and $createRifaResponse.Data.data.id) {
        $newRifaId = $createRifaResponse.Data.data.id
        Write-Host "✅ Rifa creada exitosamente - ID: $newRifaId" -ForegroundColor Green
        
        # PUT /rifas/:id - Actualizar rifa
        Write-Host "🔍 PUT /rifas/$newRifaId (Actualizar rifa):"
        
        $updateRifaBody = @{
            titulo = "Rifa Test PowerShell - ACTUALIZADA"
            descripcion = "Descripción actualizada desde PowerShell"
        } | ConvertTo-Json
        
        $updateResponse = Invoke-ApiRequest -Url "$API_URL/rifas/$newRifaId" -Method "PUT" -Headers $authHeaders -Body $updateRifaBody
        
        if ($updateResponse.Success) {
            Write-Host "✅ Rifa actualizada exitosamente" -ForegroundColor Green
        } else {
            Write-Host "❌ Error al actualizar rifa: $($updateResponse.Error)" -ForegroundColor Red
        }
        
        # POST /rifas/:id/comprar - Comprar números (simulado)
        Write-Host "🔍 POST /rifas/$newRifaId/comprar (Comprar números):"
        
        $compraBody = @{
            numeros = @(1, 2, 3)
        } | ConvertTo-Json
        
        $compraResponse = Invoke-ApiRequest -Url "$API_URL/rifas/$newRifaId/comprar" -Method "POST" -Headers $authHeaders -Body $compraBody
        
        if ($compraResponse.Success) {
            Write-Host "✅ Compra simulada exitosa" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Compra no realizada: $($compraResponse.Error)" -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "❌ Error al crear rifa: $($createRifaResponse.Error)" -ForegroundColor Red
    }
    
    # GET /rifas/user/mis-rifas - Obtener rifas del usuario
    Write-Host "🔍 GET /rifas/user/mis-rifas (Mis rifas):"
    $misRifasResponse = Invoke-ApiRequest -Url "$API_URL/rifas/user/mis-rifas" -Headers $authHeaders
    
    if ($misRifasResponse.Success) {
        $misRifasCount = 0
        if ($misRifasResponse.Data.data) {
            $misRifasCount = $misRifasResponse.Data.data.Count
        }
        Write-Host "📊 Mis rifas: $misRifasCount" -ForegroundColor Gray
    } else {
        Write-Host "❌ Error al obtener mis rifas: $($misRifasResponse.Error)" -ForegroundColor Red
    }
    
} else {
    Write-Host "⚠️ PASO 4: Saltado (sin token de autenticación)" -ForegroundColor Yellow
}

Write-Host ""

# ==========================================
# PASO 5: TESTING ERRORES COMUNES
# ==========================================

Write-Host "🔍 PASO 5: Testing manejo de errores..." -ForegroundColor Blue

# Test 404 - Rifa inexistente
Write-Host "🔍 GET /rifas/99999 (Rifa inexistente):"
$error404Response = Invoke-ApiRequest -Url "$API_URL/rifas/99999"
if ($error404Response.StatusCode -eq 404) {
    Write-Host "📊 Status: 404 ✅" -ForegroundColor Green
} else {
    Write-Host "📊 Status: $($error404Response.StatusCode)" -ForegroundColor Gray
}

# Test 401 - Sin autorización
Write-Host "🔍 POST /rifas (Sin token):"
$unauthorizedBody = @{} | ConvertTo-Json
$error401Response = Invoke-ApiRequest -Url "$API_URL/rifas" -Method "POST" -Body $unauthorizedBody
if ($error401Response.StatusCode -eq 401) {
    Write-Host "📊 Status: 401 ✅" -ForegroundColor Green
} else {
    Write-Host "📊 Status: $($error401Response.StatusCode)" -ForegroundColor Gray
}

Write-Host ""

# ==========================================
# RESUMEN FINAL
# ==========================================

Write-Host "📋 RESUMEN FINAL" -ForegroundColor Blue
Write-Host "========================================"

if ($token) {
    Write-Host "✅ Autenticación: FUNCIONANDO" -ForegroundColor Green
} else {
    Write-Host "❌ Autenticación: CON PROBLEMAS" -ForegroundColor Red
}

if ($rifasResponse.Success -and $rifasResponse.Data.data.Count -gt 0) {
    Write-Host "✅ Endpoint GET /rifas: FUNCIONANDO" -ForegroundColor Green
} else {
    Write-Host "⚠️ Endpoint GET /rifas: SIN DATOS" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 ACCIONES RECOMENDADAS:"
Write-Host "1. Si hay errores de autenticación: verificar JWT secrets"
Write-Host "2. Si no hay rifas: ejecutar el script SQL de setup"
Write-Host "3. Si hay errores 500: revisar logs del servidor"
Write-Host "4. Si todo funciona: continuar con frontend"

Write-Host ""
Write-Host "🎉 TESTING COMPLETADO" -ForegroundColor Green

# Pausa para ver resultados
Read-Host "Presiona Enter para continuar..."