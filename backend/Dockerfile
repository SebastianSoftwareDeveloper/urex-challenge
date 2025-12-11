FROM php:8.4-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install PCOV for code coverage
RUN pecl install pcov && docker-php-ext-enable pcov

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Create application user (for rootless Docker compatibility)
RUN useradd -G www-data,root -u 1000 -d /home/appuser appuser
RUN mkdir -p /home/appuser/.composer && \
    chown -R appuser:appuser /home/appuser

# Set working directory
WORKDIR /var/www

# Copy existing application directory permissions
COPY --chown=appuser:appuser . /var/www

# Change current user to appuser
USER appuser

# Install Laravel dependencies if composer.json exists
RUN if [ -f composer.json ]; then composer install --no-interaction --no-dev --prefer-dist; fi

EXPOSE 9000

CMD ["php-fpm"]
