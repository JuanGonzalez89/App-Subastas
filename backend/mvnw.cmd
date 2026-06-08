@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM ----------------------------------------------------------------------------
@IF "%__MVNW_ARG0_NAME__%"=="" (SET "BASE_DIR=%~dp0") ELSE (SET "BASE_DIR=%__MVNW_ARG0_NAME__%")
@SET MAVEN_PROJECTBASEDIR=%BASE_DIR%

@IF NOT "%JAVA_HOME%"=="" GOTO javaHomeSet
@FOR /f "tokens=*" %%a IN ('where java 2^>nul') DO SET "JAVA_PATH=%%a"
@IF NOT "%JAVA_PATH%"=="" GOTO javaFound
@ECHO Error: JAVA_HOME not found in your environment. >&2
@ECHO Please set the JAVA_HOME variable in your environment to match the >&2
@ECHO location of your Java installation. >&2
@GOTO error
:javaFound
@SET "JAVA_HOME=%JAVA_PATH:\bin\java.exe=%"
:javaHomeSet
@SET "JAVA_EXE=%JAVA_HOME%/bin/java.exe"
@IF EXIST "%JAVA_EXE%" GOTO foundJavaFromJavaHome
@ECHO Error: JAVA_HOME is set to an invalid directory: %JAVA_HOME% >&2
@GOTO error
:foundJavaFromJavaHome

@SET WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
@SET WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain
@SET DOWNLOAD_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar

@IF EXIST %WRAPPER_JAR% (
    @"%JAVA_EXE%" %JVM_CONFIG_MAVEN_PROPS% %MAVEN_OPTS% %MAVEN_DEBUG_OPTS% -classpath %WRAPPER_JAR% "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" %WRAPPER_LAUNCHER% %*
    @IF ERRORLEVEL 1 GOTO error
    @GOTO end
)

@echo Downloading Maven wrapper...
@"%JAVA_EXE%" -classpath "" org.apache.maven.wrapper.MavenWrapperDownloader "%DOWNLOAD_URL%" %WRAPPER_JAR%
@IF ERRORLEVEL 1 GOTO error

@"%JAVA_EXE%" %JVM_CONFIG_MAVEN_PROPS% %MAVEN_OPTS% %MAVEN_DEBUG_OPTS% -classpath %WRAPPER_JAR% "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" %WRAPPER_LAUNCHER% %*
@IF ERRORLEVEL 1 GOTO error
@GOTO end

:error
@SET ERROR_CODE=1

:end
@IF "%MVNW_REUSE_WINDOWS_USERPROFILE_MAVEN_SETTINGS%"=="" (
  @SET "EXIT_CODE=%ERROR_CODE%"
  @EXIT /B %EXIT_CODE%
)
@EXIT /B %ERROR_CODE%
